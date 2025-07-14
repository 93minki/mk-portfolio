interface SimpleAnalyticsData {
  todayVisits: number;
  totalVisits: number;
}

interface CloudflareEnv {
  CF_API_TOKEN: string;
  CF_ACCOUNT_ID: string;
  CF_SITE_TAG: string;
}

interface GraphQLResponse {
  data?: {
    viewer?: {
      zones?: Array<{
        httpRequestsAdaptiveGroups?: Array<{
          sum?: {
            requests?: number;
            visits?: number;
          };
          dimensions?: {
            date?: string;
          };
        }>;
      }>;
    };
  };
  errors?: Array<{
    message: string;
  }>;
}

export async function getSimpleAnalytics(
  env: CloudflareEnv
): Promise<SimpleAnalyticsData | null> {
  console.log("🔄 Switching to GraphQL API for Web Analytics!");

  // API 토큰과 Site Tag 확인 (Zone ID가 필요할 수도 있음)
  if (!env.CF_API_TOKEN || !env.CF_SITE_TAG) {
    console.log("Missing CF_API_TOKEN or CF_SITE_TAG");
    return null;
  }

  try {
    // 날짜 계산 (ISO 8601 형식)
    const now = new Date();
    const today = now.toISOString();
    const yesterday = new Date(
      now.getTime() - 24 * 60 * 60 * 1000
    ).toISOString();
    const oneWeekAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    console.log("📅 Date range:", { yesterday, today, oneWeekAgo });

    // GraphQL 쿼리 - Web Analytics용
    const query = `
      query GetWebAnalytics($zoneTag: String!, $since: String!, $until: String!) {
        viewer {
          zones(filter: {zoneTag: $zoneTag}) {
            httpRequestsAdaptiveGroups(
              limit: 1000,
              filter: {
                datetime_geq: $since,
                datetime_lt: $until
              }
            ) {
              sum {
                requests
                visits
              }
              dimensions {
                date
              }
            }
          }
        }
      }
    `;

    const headers = {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json",
    };

    console.log("🔗 Calling GraphQL API for Web Analytics...");

    // 두 개의 쿼리: 오늘 데이터와 전체 데이터
    const [todayResponse, totalResponse] = await Promise.all([
      // 오늘 데이터
      fetch("https://api.cloudflare.com/client/v4/graphql", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query,
          variables: {
            zoneTag: env.CF_SITE_TAG,
            since: yesterday,
            until: today,
          },
        }),
      }),

      // 최근 7일 데이터
      fetch("https://api.cloudflare.com/client/v4/graphql", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query,
          variables: {
            zoneTag: env.CF_SITE_TAG,
            since: oneWeekAgo,
            until: today,
          },
        }),
      }),
    ]);

    console.log("✅ GraphQL calls completed");

    const [todayData, totalData] = await Promise.all([
      todayResponse.json() as Promise<GraphQLResponse>,
      totalResponse.json() as Promise<GraphQLResponse>,
    ]);

    console.log("📊 Today Response:", JSON.stringify(todayData, null, 2));
    console.log("📊 Total Response:", JSON.stringify(totalData, null, 2));

    // 에러 체크
    if (todayData.errors || totalData.errors) {
      console.error("GraphQL Errors:", {
        today: todayData.errors,
        total: totalData.errors,
      });
      return null;
    }

    // 데이터 추출
    const todayZones = todayData.data?.viewer?.zones || [];
    const totalZones = totalData.data?.viewer?.zones || [];

    if (todayZones.length === 0 || totalZones.length === 0) {
      console.log(
        "❌ No zones found - Site Tag might be incorrect or need Zone ID"
      );
      return null;
    }

    // 오늘 방문자 수
    const todayRequests = todayZones[0]?.httpRequestsAdaptiveGroups || [];
    const todayVisits = todayRequests.reduce((sum: number, item) => {
      return sum + (item.sum?.visits || item.sum?.requests || 0);
    }, 0);

    // 총 방문자 수 (최근 7일)
    const totalRequests = totalZones[0]?.httpRequestsAdaptiveGroups || [];
    const totalVisits = totalRequests.reduce((sum: number, item) => {
      return sum + (item.sum?.visits || item.sum?.requests || 0);
    }, 0);

    console.log("🎯 Final result:", { todayVisits, totalVisits });

    return {
      todayVisits,
      totalVisits,
    };
  } catch (error) {
    console.error("💥 GraphQL Analytics Error:", error);
    return null;
  }
}

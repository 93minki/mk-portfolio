interface SimpleAnalyticsData {
  todayVisits: number;
  totalVisits: number;
}

interface CloudflareEnv {
  CF_API_TOKEN: string;
  CF_ACCOUNT_ID: string;
  CF_SITE_TAG: string;
}

interface AnalyticsResponse {
  success: boolean;
  result: {
    data: Array<{
      sum: {
        visits: number;
      };
    }>;
  };
}

export async function getSimpleAnalytics(
  env: CloudflareEnv
): Promise<SimpleAnalyticsData | null> {
  // 환경변수 체크 및 로깅
  console.log("Analytics function called - all env vars are present!");
  console.log("Environment variables:", {
    hasApiToken: !!env.CF_API_TOKEN,
    hasAccountId: !!env.CF_ACCOUNT_ID,
    hasSiteTag: !!env.CF_SITE_TAG,
  });

  // 환경변수가 없으면 일찍 반환
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID || !env.CF_SITE_TAG) {
    console.log("Missing required environment variables for analytics");
    return null;
  }

  try {
    console.log("🚀 Starting API calls...");
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

    const headers = {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json",
    };

    console.log("📅 Date range:", { today, thirtyDaysAgoStr });
    console.log("🔗 About to call APIs...");

    // 2개 API 호출
    const [todayResponse, totalResponse] = await Promise.all([
      // 오늘 방문자 수
      fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/rum/site_info/${env.CF_SITE_TAG}/timeseries_analytics?metrics=visits&since=${today}&until=${today}`,
        { headers }
      ),

      // 총 방문자 수 (최근 30일)
      fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/rum/site_info/${env.CF_SITE_TAG}/timeseries_analytics?metrics=visits&since=${thirtyDaysAgoStr}&until=${today}`,
        { headers }
      ),
    ]);

    console.log("✅ API calls completed, parsing JSON...");

    const [todayData, totalData] = await Promise.all([
      todayResponse.json() as Promise<AnalyticsResponse>,
      totalResponse.json() as Promise<AnalyticsResponse>,
    ]);

    console.log("📊 API Responses:", {
      todaySuccess: todayData.success,
      totalSuccess: totalData.success,
      todayDataLength: todayData.result?.data?.length || 0,
      totalDataLength: totalData.result?.data?.length || 0,
    });

    if (!todayData.success || !totalData.success) {
      console.error("Analytics API Error:", { todayData, totalData });
      return null;
    }

    // 데이터 추출
    const todayVisits = todayData.result?.data?.[0]?.sum?.visits || 0;
    const totalVisits =
      totalData.result?.data?.reduce(
        (sum: number, item: { sum: { visits: number } }) => {
          return sum + (item.sum?.visits || 0);
        },
        0
      ) || 0;

    console.log("🎯 Final result:", { todayVisits, totalVisits });

    return {
      todayVisits,
      totalVisits,
    };
  } catch (error) {
    console.error("💥 Analytics Error:", error);
    return null;
  }
}

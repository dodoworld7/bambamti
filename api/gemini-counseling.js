/**
 * 보안 점검용 주석:
 * 1. 프론트엔드에 API 키를 직접 노출하면 개발자 도구의 네트워크 탭 등을 통해 노출되므로 보안상 위험합니다.
 * 2. 이를 방지하기 위해 Gemini API 호출은 이 Vercel Serverless Function(백엔드)에서 안전하게 처리합니다.
 * 3. 로컬 환경 개발 시 사용되는 `.env` 또는 `.env.local` 파일은 GitHub 등의 원격 저장소에 올리지 않도록 `.gitignore`에 등록해야 합니다.
 * 4. Vercel 배포 시에는 Vercel 콘솔의 Project Settings -> Environment Variables 메뉴에 `GEMINI_API_KEY`를 등록하여 안전하게 참조하도록 합니다.
 * 5. Gemini로 전송하는 데이터는 학생 실명, 학번, 사진 경로, 비밀번호를 제외한 익명화 정보(학생 별칭, 성적 요약, 학습 특성 요약) 및 교사 고민 정보로 제한합니다.
 */

// Node.js 환경에서 동작하는 Vercel Serverless Function
module.exports = async function handler(req, res) {
  // 1. POST 요청만 허용
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "Method Not Allowed - POST 요청만 허용됩니다." });
  }

  // 2. 요청 바디 데이터 추출
  const { studentAlias, gradeSummary, learningTraits, teacherConcern } = req.body || {};

  // 3. 필수 값 유효성 검증
  if (!studentAlias || !gradeSummary || !learningTraits || !teacherConcern) {
    return res.status(400).json({
      success: false,
      error: "상담 요청을 위한 필수 데이터(studentAlias, gradeSummary, learningTraits, teacherConcern)가 누락되었습니다."
    });
  }

  // 4. API 키 환경변수 검증
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "GEMINI_API_KEY 환경 변수가 설정되지 않았습니다."
    });
  }

  // 5. 프롬프트 구성 (요구사항 반영)
  const prompt = `
당신은 학생들의 학습을 돕고 대화로 문제를 해결하려는 교사를 보좌하는 AI 상담 전략 도우미입니다.
학생의 개인정보 보호를 위해 실제 이름과 학번 대신 익명화된 데이터가 제공됩니다.

[상담 대상 학생 정보]
- 학생 식별칭: ${studentAlias}
- 성적 및 성취도 요약: ${gradeSummary}
- 학습 특성 및 행동 요약: ${learningTraits}

[교사의 상담 고민]
- 고민 내용: ${teacherConcern}

[상담 조언 가이드라인]
1. 학생의 상태를 부정적으로 단정짓거나 성급하게 진단하지 마십시오. (예: "의지가 부족하다", "주의력 문제가 있다", "심리적 문제가 있다"와 같은 단정하는 표현은 절대 피하십시오.)
2. 교사가 학생의 특성을 긍정적이면서 보완 가능한 측면에서 이해하고 대화할 수 있도록 지원하는 방향으로 작성하십시오.
3. 상담 전략은 단순한 참고용이며, 최종 판단과 실제 대화 방향은 교사가 학생의 상황을 종합적으로 고려하여 결정해야 함을 염두에 두십시오.

[응답 작성 양식]
반드시 다음 6가지 순서에 따라 소제목을 붙여 한국어로 응답을 작성하십시오:

1. 현재 상황 요약
(학생의 학습 데이터와 교사의 상담 고민을 한 문장 내외로 명확하게 요약해 줍니다.)

2. 학생 데이터 기반 해석
(제시된 성적과 특성 정보를 토대로 학생의 행동에 대한 긍정적 의도나 보완 가능한 원인을 다각도로 조심스럽게 해석합니다. 단정적 표현 금지.)

3. 상담 접근 전략
(교사가 해당 학생과 대화할 때 가질 태도와 접근 방식의 구체적 전략을 설명합니다.)

4. 교사가 던질 수 있는 질문 3개
(학생이 마음을 열고 스스로 생각을 털어놓을 수 있도록 돕는 개방형 질문 3가지를 구체적인 화법 예시로 제안합니다.)

5. 피해야 할 말 또는 주의점
(대화를 차단하거나 학생에게 심리적 방어벽을 세우게 만드는 피해야 할 말이나 경계해야 할 교사의 태도를 짚어줍니다.)

6. 다음 수업에서 해볼 수 있는 작은 지원
(수업 시간 내에 교사가 해당 학생을 위해 바로 실천할 수 있는 작고 구체적인 관심 표현이나 피드백 방안을 제시합니다.)
`;

  // 6. Gemini REST API 호출 (gemini-2.5-pro 모델 사용)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.95
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `Gemini API 호출 중 오류가 발생했습니다: ${errorText}`
      });
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return res.status(500).json({
        success: false,
        error: "Gemini 응답 데이터의 구조가 올바르지 않습니다."
      });
    }

    // 7. 성공 응답 반환
    return res.status(200).json({
      success: true,
      result: resultText
    });

  } catch (error) {
    // 8. 실패 응답 반환
    return res.status(500).json({
      success: false,
      error: `서버 내부 오류: ${error.message}`
    });
  }
};

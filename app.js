const USERS = [
  { id: "admin", password: "2026", role: "admin", name: "관리자" },
  { id: "10101", password: "1234", role: "student", studentId: "10101" },
  { id: "10102", password: "1234", role: "student", studentId: "10102" },
  { id: "10103", password: "1234", role: "student", studentId: "10103" },
];

const STUDENTS = [
  {
    id: "10101",
    name: "김코딩",
    photo: "assets/10101_김코딩.jpg",
    grades: {
      "정보 수행평가": "A",
      "웹앱 프로젝트": "92점",
      "디지털 윤리 퀴즈": "88점",
      "수업 참여도": "상",
    },
    traits: [
      "문제 해결 과정을 차분히 설명합니다.",
      "새 도구를 시도할 때 기록을 꼼꼼히 남깁니다.",
      "제출 전 확인 습관을 더 연습하면 좋습니다.",
    ],
    teacherMemo: "프론트엔드 구조 이해가 빠르며, 팀원 질문에 답하는 태도가 좋습니다.",
  },
  {
    id: "10102",
    name: "박개발",
    photo: "assets/10102_박개발.jpg",
    grades: {
      "정보 수행평가": "B+",
      "웹앱 프로젝트": "86점",
      "디지털 윤리 퀴즈": "91점",
      "수업 참여도": "중상",
    },
    traits: [
      "협업 중 역할 분담을 잘 지킵니다.",
      "UI 수정 아이디어를 자주 제안합니다.",
      "프로젝트 범위를 작게 나누는 연습이 필요합니다.",
    ],
    teacherMemo: "기능 구현 의욕이 높고, 오류가 날 때 원인을 함께 추적하려는 태도가 좋습니다.",
  },
  {
    id: "10103",
    name: "이교사",
    photo: "assets/10103_이교사.jpg",
    grades: {
      "정보 수행평가": "A-",
      "웹앱 프로젝트": "89점",
      "디지털 윤리 퀴즈": "95점",
      "수업 참여도": "상",
    },
    traits: [
      "학습 내용을 자기 언어로 정리합니다.",
      "개선할 지점을 발견하면 근거를 함께 제시합니다.",
      "코드 주석을 더 구체적으로 쓰면 좋습니다.",
    ],
    teacherMemo: "질문의 초점이 좋고, 개선 방향을 토의하는 데 적극적입니다.",
  },
];

const loginForm = document.querySelector("#loginForm");
const userIdInput = document.querySelector("#userId");
const passwordInput = document.querySelector("#password");
const loginMessage = document.querySelector("#loginMessage");
const logoutButton = document.querySelector("#logoutButton");
const loginView = document.querySelector("#loginView");
const studentView = document.querySelector("#studentView");
const adminView = document.querySelector("#adminView");

let currentUser = null;

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = userIdInput.value.trim();
  const password = passwordInput.value;
  const user = USERS.find((item) => item.id === id && item.password === password);

  if (!user) {
    loginMessage.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  currentUser = user;
  loginMessage.textContent = "";
  loginForm.reset();

  if (user.role === "admin") {
    renderAdminDashboard();
  } else {
    const student = STUDENTS.find((item) => item.id === user.studentId);
    renderStudentPage(student);
  }
});

logoutButton.addEventListener("click", () => {
  currentUser = null;
  showOnly(loginView);
  logoutButton.classList.add("hidden");
  userIdInput.focus();
});

function showOnly(targetView) {
  [loginView, studentView, adminView].forEach((view) => view.classList.add("hidden"));
  targetView.classList.remove("hidden");
}

function renderStudentPage(student) {
  if (!student) {
    loginMessage.textContent = "학생 정보를 찾을 수 없습니다.";
    showOnly(loginView);
    return;
  }

  studentView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Student</p>
        <h2>${student.name} 학생 페이지</h2>
        <p>로그인한 학생의 학습 현황을 확인합니다.</p>
      </div>
    </div>

    <div class="student-layout">
      <article class="student-profile">
        <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
        <div class="profile-body">
          <h3>${student.name}</h3>
          <p class="student-number">학번 ${student.id}</p>
          <div class="tag-row" aria-label="학습 키워드">
            <span class="tag">정보</span>
            <span class="tag">프로젝트</span>
          </div>
        </div>
      </article>

      <div class="content-stack">
        ${renderGrades(student.grades, false, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
      </div>
    </div>
  `;

  showOnly(studentView);
  logoutButton.classList.remove("hidden");
}

function renderAdminDashboard() {
  adminView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Admin</p>
        <h2>관리자 대시보드</h2>
        <p>학생 3명의 학습 현황을 한 화면에서 비교합니다.</p>
      </div>
    </div>

    <section class="admin-grid" aria-label="전체 학생 정보">
      ${STUDENTS.map(renderStudentCard).join("")}
    </section>

    <!-- AI 학생 상담 전략 도우미 섹션 -->
    <section id="aiCounselingSection" class="counseling-panel">
      <div class="section-title">
        <h3 id="counselingTitle">🔮 AI 학생 상담 전략 도우미</h3>
      </div>
      
      <div class="counseling-content-layout">
        <!-- 선택된 학생 표시 영역 -->
        <div class="selected-student-area">
          <h4>선택된 학생 정보</h4>
          <div id="counselingStudentInfo" class="counseling-student-info">
            <p class="info-placeholder">학생 카드의 <strong>[상담 전략 요청]</strong> 버튼을 눌러 학생을 선택해 주세요.</p>
          </div>
        </div>

        <!-- 고민 입력 및 미리보기 -->
        <div class="counseling-input-area">
          <label for="teacherConcernInput" class="counseling-label">교사 고민 입력</label>
          <textarea 
            id="teacherConcernInput" 
            class="counseling-textarea" 
            placeholder="예시 고민 중 하나를 입력하거나 직접 고민을 입력하세요.&#10;- 수업 참여는 좋은데 평가 결과가 낮습니다. 어떻게 상담하면 좋을까요?&#10;- 과제 제출이 자주 늦습니다. 혼내기보다는 원인을 파악하고 싶은데 어떻게 접근하면 좋을까요?&#10;- 친구들과 협업할 때 소극적인 편입니다. 어떤 질문으로 대화를 시작하면 좋을까요?"
            disabled
          ></textarea>

          <div class="preview-area">
            <span class="preview-label">전송 데이터 미리보기 (개인정보 제외)</span>
            <pre id="counselingPreview" class="preview-box">{}</pre>
          </div>

          <button id="sendCounselingBtn" class="primary-button counseling-submit-btn" type="button" disabled>
            AI 상담 전략 받기
          </button>
        </div>
      </div>

      <!-- Gemini 응답 표시 영역 -->
      <div id="counselingResultWrapper" class="counseling-result-wrapper hidden">
        <h4>Gemini AI 추천 상담 전략</h4>
        <div id="counselingResult" class="counseling-result-content"></div>
      </div>

      <!-- 오류 메시지 표시 영역 -->
      <div id="counselingError" class="counseling-error-box hidden"></div>

      <!-- 화면 안내 문구 -->
      <p class="counseling-disclaimer">
        AI 상담 전략은 참고용입니다. 최종 판단과 실제 상담은 교사가 학생의 상황을 종합적으로 고려하여 진행해야 합니다.
      </p>
    </section>
  `;

  showOnly(adminView);
  logoutButton.classList.remove("hidden");
  initCounselingListeners();
}

function renderStudentCard(student) {
  return `
    <article class="student-card">
      <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
      <div class="student-card-body">
        <h3>${student.name}</h3>
        <p class="student-number">학번 ${student.id}</p>
        ${renderGrades(student.grades, true, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
        <button class="ghost-button counseling-request-btn" data-student-id="${student.id}" type="button" style="width: 100%; margin-top: 15px; border-color: var(--line);">
          상담 전략 요청
        </button>
      </div>
    </article>
  `;
}

function renderGrades(grades, compact = false, headingId = "gradesTitle") {
  const rows = Object.entries(grades)
    .map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`)
    .join("");

  return `
    <section aria-labelledby="${headingId}">
      <div class="section-title">
        <h3 id="${headingId}">성적 정보</h3>
      </div>
      <table class="grade-table ${compact ? "compact-table" : ""}">
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderTraits(student) {
  return `
    <section aria-labelledby="traitsTitle-${student.id}">
      <div class="section-title">
        <h3 id="traitsTitle-${student.id}">학습 특성 및 교사 메모</h3>
      </div>
      <ul class="memo-list">
        ${student.traits.map((trait) => `<li>${trait}</li>`).join("")}
        <li>${student.teacherMemo}</li>
      </ul>
    </section>
  `;
}

/**
 * 보안 점검 및 설계 가이드 주석:
 * 1. 프론트엔드 코드에 직접 API 키를 기재할 경우 개발자 도구(F12)의 소스 코드나 네트워크 패킷에서 노출될 위험이 큽니다.
 * 2. 이에 따라 Gemini API 호출은 백엔드 환경(Vercel Serverless Function)에서 프록시 형태로 대행 처리합니다.
 * 3. 로컬 테스트 및 설정용 `.env` 또는 `.env.local` 파일은 원격 코드 공유 시 유출되지 않도록 `.gitignore`에 등록하여 관리합니다.
 * 4. Vercel 배포 시에는 Project Settings of Environment Variables(환경 변수) 탭에 GEMINI_API_KEY를 등록하여 백엔드에서 보안 환경 하에 사용하게 합니다.
 * 5. Gemini API로 송신하는 데이터는 개인정보(학생 이름, 학번, 사진 경로, 비밀번호)가 절대 포함되지 않으며 익명화된 별칭과 요약 정보만 제한하여 전송합니다.
 */

let selectedStudent = null;

function initCounselingListeners() {
  const adminGrid = adminView.querySelector(".admin-grid");
  const concernInput = adminView.querySelector("#teacherConcernInput");
  const previewBox = adminView.querySelector("#counselingPreview");
  const sendBtn = adminView.querySelector("#sendCounselingBtn");
  const resultWrapper = adminView.querySelector("#counselingResultWrapper");
  const resultDiv = adminView.querySelector("#counselingResult");
  const errorBox = adminView.querySelector("#counselingError");
  const studentInfoDiv = adminView.querySelector("#counselingStudentInfo");

  selectedStudent = null;

  // 1. 상담 전략 요청 버튼 클릭
  adminGrid.addEventListener("click", (event) => {
    const btn = event.target.closest(".counseling-request-btn");
    if (!btn) return;

    const studentId = btn.dataset.studentId;
    const student = STUDENTS.find((s) => s.id === studentId);
    if (!student) return;

    selectedStudent = student;

    // UI 필드 업데이트
    const alias = getStudentAlias(studentId);
    const gradeSum = Object.entries(student.grades).map(([subject, score]) => `${subject}: ${score}`).join(", ");
    const traitSum = `${student.traits.join(" / ")} (교사 메모: ${student.teacherMemo})`;

    studentInfoDiv.innerHTML = `
      <div class="info-grid">
        <div class="info-group">
          <strong>🖥️ 화면 표시용 정보 (개인정보 포함)</strong>
          <p>이름: <span class="highlight-text">${student.name}</span></p>
          <p>학번: <span class="highlight-text">${student.id}</span></p>
        </div>
        <div class="info-group anonymized">
          <strong>🔒 Gemini 전송용 익명화 정보</strong>
          <p>대상 별칭: <span>${alias}</span></p>
          <p>성적 요약: <span class="small-text">${gradeSum}</span></p>
          <p>학습 특성: <span class="small-text">${traitSum}</span></p>
        </div>
      </div>
    `;

    // 컨트롤 활성화
    concernInput.removeAttribute("disabled");
    sendBtn.removeAttribute("disabled");
    concernInput.value = "";
    concernInput.focus();

    // 기존 결과 영역 숨기기 및 리셋
    resultWrapper.classList.add("hidden");
    resultDiv.innerHTML = "";
    errorBox.classList.add("hidden");
    errorBox.textContent = "";

    updatePreview();
  });

  // 2. 고민 입력 실시간 변경 시 미리보기 갱신
  concernInput.addEventListener("input", updatePreview);

  function updatePreview() {
    if (!selectedStudent) {
      previewBox.textContent = "{}";
      return;
    }

    const alias = getStudentAlias(selectedStudent.id);
    const gradeSum = Object.entries(selectedStudent.grades).map(([subject, score]) => `${subject}: ${score}`).join(", ");
    const traitSum = `${selectedStudent.traits.join(" / ")} (교사 메모: ${selectedStudent.teacherMemo})`;

    const previewData = {
      studentAlias: alias,
      gradeSummary: gradeSum,
      learningTraits: traitSum,
      teacherConcern: concernInput.value
    };

    previewBox.textContent = JSON.stringify(previewData, null, 2);
  }

  // 3. AI 상담 전략 받기 버튼 클릭
  sendBtn.addEventListener("click", async () => {
    if (!selectedStudent) return;

    const teacherConcern = concernInput.value.trim();
    if (!teacherConcern) {
      alert("상담 고민을 먼저 입력해주세요.");
      concernInput.focus();
      return;
    }

    // 로딩 처리
    resultWrapper.classList.remove("hidden");
    resultDiv.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">AI가 상담 전략을 생성하는 중입니다.</p>
      </div>
    `;
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
    sendBtn.setAttribute("disabled", "true");

    const alias = getStudentAlias(selectedStudent.id);
    const gradeSum = Object.entries(selectedStudent.grades).map(([subject, score]) => `${subject}: ${score}`).join(", ");
    const traitSum = `${selectedStudent.traits.join(" / ")} (교사 메모: ${selectedStudent.teacherMemo})`;

    try {
      const response = await fetch("/api/gemini-counseling", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentAlias: alias,
          gradeSummary: gradeSum,
          learningTraits: traitSum,
          teacherConcern: teacherConcern
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        resultDiv.innerHTML = formatMarkdown(data.result);
      } else {
        throw new Error(data.error || "상담 요청을 불러오지 못했습니다.");
      }
    } catch (error) {
      console.error(error);
      resultWrapper.classList.add("hidden");
      errorBox.classList.remove("hidden");
      errorBox.textContent = "AI 상담 전략을 불러오지 못했습니다. API 키 또는 Vercel 환경 변수를 확인해주세요.";
    } finally {
      sendBtn.removeAttribute("disabled");
    }
  });
}

function getStudentAlias(studentId) {
  const index = STUDENTS.findIndex((s) => s.id === studentId);
  if (index === -1) return "학생 X";
  return `학생 ${String.fromCharCode(65 + index)}`; // A, B, C...
}

function formatMarkdown(text) {
  if (!text) return "";
  
  // HTML 이스케이프
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 1. 볼드 처리 (**text** -> <strong>text</strong>)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 2. 소제목 매핑 (1. 현재 상황 요약 등)
  const sections = [
    "현재 상황 요약",
    "학생 데이터 기반 해석",
    "상담 접근 전략",
    "교사가 던질 수 있는 질문 3개",
    "피해야 할 말 또는 주의점",
    "다음 수업에서 해볼 수 있는 작은 지원"
  ];
  
  sections.forEach((sec, idx) => {
    const num = idx + 1;
    const regex = new RegExp(`^${num}\\.\\s+${sec}(.*$)`, "gim");
    html = html.replace(regex, `<h4 class="result-section-title">📌 ${num}. ${sec}$1</h4>`);
  });

  // 3. 일반 헤더 매핑
  html = html.replace(/^### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^## (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^# (.*$)/gim, '<h3>$1</h3>');

  // 4. 일반 리스트 매칭
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // 5. 줄 단위 처리 (소제목 제외 숫자 리스트 등)
  const lines = html.split("\n");
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("<h4") || 
      trimmed.startsWith("<li") || 
      trimmed.startsWith("<ul") || 
      trimmed.startsWith("<h3") || 
      trimmed.startsWith("<h5>") || 
      trimmed.startsWith("<strong>")
    ) {
      return line;
    }
    const numListRegex = /^\s*(\d+)\.\s+(.*$)/i;
    if (numListRegex.test(line)) {
      return line.replace(numListRegex, '<li>$2</li>');
    }
    return line;
  });
  
  html = processedLines.join("\n");
  html = html.replace(/\n/g, "<br>");
  html = html.replace(/(<br>){2,}/g, "<br><br>");

  return html;
}

showOnly(loginView);

/*
  app.js 的作用：
  1. 从表单里读取用户填写的岗位信息
  2. 把岗位信息保存到浏览器 localStorage
  3. 从 localStorage 读取数据并显示成卡片
  4. 支持按投递状态筛选，也支持删除岗位
*/

// localStorage 的键名，相当于给这份数据取一个固定名字。
const STORAGE_KEY = "jobFilterRecords";

// 获取页面上的元素，后面会经常用到它们。
const jobForm = document.querySelector("#jobForm");
const jobList = document.querySelector("#jobList");
const jobCount = document.querySelector("#jobCount");
const statusFilter = document.querySelector("#statusFilter");

// jobs 数组用来存放所有岗位记录。
let jobs = loadJobs();

// 页面打开时，先把 localStorage 里的旧数据显示出来。
renderJobs();

// 监听表单提交事件。用户点击“保存岗位”时，会执行这里的代码。
jobForm.addEventListener("submit", function (event) {
  // 阻止表单默认刷新页面，这样数据不会因为刷新而丢失。
  event.preventDefault();

  const newJob = {
    // Date.now() 会生成一个当前时间数字，适合作为每条记录的唯一 id。
    id: Date.now(),
    companyName: getInputValue("companyName"),
    jobTitle: getInputValue("jobTitle"),
    city: getInputValue("city"),
    salary: getInputValue("salary") || "未填写",
    jobType: getInputValue("jobType"),
    status: getInputValue("status"),
    note: getInputValue("note") || "暂无备注",
    createdAt: formatDate(new Date())
  };

  jobs.unshift(newJob);
  saveJobs();
  renderJobs();

  // 保存成功后清空表单，方便继续录入下一条。
  jobForm.reset();
});

// 监听筛选下拉框变化。选择不同状态时，列表会重新显示。
statusFilter.addEventListener("change", renderJobs);

// 使用事件委托处理删除按钮。
// 好处是：即使岗位卡片是后面动态创建的，删除按钮也能正常工作。
jobList.addEventListener("click", function (event) {
  if (!event.target.classList.contains("delete-button")) {
    return;
  }

  const jobId = Number(event.target.dataset.id);
  jobs = jobs.filter(function (job) {
    return job.id !== jobId;
  });

  saveJobs();
  renderJobs();
});

// 根据 input/select/textarea 的 id 获取用户输入的值。
function getInputValue(id) {
  return document.querySelector("#" + id).value.trim();
}

// 把 jobs 数组保存到 localStorage。
function saveJobs() {
  // localStorage 只能保存字符串，所以要用 JSON.stringify 转成字符串。
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

// 从 localStorage 读取岗位数据。
function loadJobs() {
  const savedJobs = localStorage.getItem(STORAGE_KEY);

  // 第一次打开页面时还没有数据，直接返回空数组。
  if (!savedJobs) {
    return [];
  }

  // JSON.parse 可以把字符串还原成数组。
  return JSON.parse(savedJobs);
}

// 渲染岗位列表：把 jobs 数组变成页面上的岗位卡片。
function renderJobs() {
  const selectedStatus = statusFilter.value;

  const visibleJobs = jobs.filter(function (job) {
    return selectedStatus === "全部" || job.status === selectedStatus;
  });

  jobCount.textContent = "共 " + visibleJobs.length + " 条记录";

  if (visibleJobs.length === 0) {
    jobList.innerHTML = '<div class="empty-state">暂无岗位记录，请先新增一条岗位。</div>';
    return;
  }

  jobList.innerHTML = visibleJobs.map(function (job) {
    return `
      <article class="job-card">
        <div class="job-card-header">
          <div>
            <h3>${escapeHTML(job.jobTitle)}</h3>
            <p class="company">${escapeHTML(job.companyName)}</p>
          </div>
          <span class="status-tag">${escapeHTML(job.status)}</span>
        </div>

        <div class="job-info">
          <div class="info-item">
            <strong>城市</strong>
            ${escapeHTML(job.city)}
          </div>
          <div class="info-item">
            <strong>月薪</strong>
            ${escapeHTML(job.salary)}
          </div>
          <div class="info-item">
            <strong>岗位类型</strong>
            ${escapeHTML(job.jobType)}
          </div>
        </div>

        <p class="note">${escapeHTML(job.note)}</p>
        <button class="delete-button" type="button" data-id="${job.id}">删除</button>
      </article>
    `;
  }).join("");
}

// 把日期格式化成更容易看的样子。
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// 防止用户输入的内容被当成 HTML 代码执行。
// 对小项目来说，这一步也很重要，可以避免一些基础安全问题。
function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

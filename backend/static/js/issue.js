
document.addEventListener('DOMContentLoaded', function() {

  const issuesContainer = document.getElementById('issuesContainer');
  const searchInput = document.getElementById('searchInput');

  // 假数据
  const issues = [
    {
      title: "How to stay motivated in running?",
      description: "I'm struggling to keep up with my daily running challenge, any tips?",
      tags: ["Fitness", "Mindset"],
      answers: 6,
      views: 230,
      author: "John Doe",
      time: "2h ago"
    },
    {
      title: "Best high-protein meals after workout?",
      description: "Looking for easy meals rich in protein for recovery.",
      tags: ["Food"],
      answers: 3,
      views: 120,
      author: "Jane Smith",
      time: "5h ago"
    },
    {
      title: "How to prevent knee pain when running?",
      description: "Feeling some pain during long runs, how to avoid injury?",
      tags: ["Fitness", "Health"],
      answers: 8,
      views: 300,
      author: "Mike Lee",
      time: "1d ago"
    }
    // 可以继续添加更多问题
  ];

  // 渲染问题列表
  function renderIssues(filter = "") {
    issuesContainer.innerHTML = "";

    const filtered = issues.filter(issue => issue.title.toLowerCase().includes(filter.toLowerCase()));

    filtered.forEach(issue => {
      const hotTag = issue.answers >= 5 ? "🔥 Hot" : "";
      const tagsHtml = issue.tags.map(tag => `<span style="background:#e0e5ec; border-radius:8px; padding:2px 8px; margin-right:6px; font-size:0.8rem;">${tag}</span>`).join(" ");

      issuesContainer.innerHTML += `
        <a href="issue_detail.html" style="text-decoration: none; color: inherit;">
          <div class="forum-post">
            <div class="post-header">
              <span class="post-title">${hotTag} ${issue.title}</span>
              <small class="text-muted">${issue.answers} answers • ${issue.views} views • ${issue.time}</small>
            </div>
            <p class="post-content">${issue.description}</p>
            <div class="post-actions">
              ${tagsHtml}
              <span style="font-size: 0.85rem; color: #666;">by ${issue.author}</span>
            </div>
          </div>
        </a>
      `;
    });
  }

  // 搜索功能
  searchInput.addEventListener('input', function() {
    renderIssues(this.value);
  });

  // 初始化渲染
  renderIssues();

});


// ==========================================
// ROADKIILL CLUB - MAIN CONFIGURATION
// ==========================================

const GITHUB_USERNAME = "roadkiill";

// Add projects here!
const projects = [
    {
        name: "PyChat",
        description: "The simple chatting app.",
        type: "SOFTWARE",
        url: "https://roadkiill.github.io/PyChat/"
    },
];

// ==========================================
// PROJECTS
// ==========================================

const projectList = document.getElementById("project-list");

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderProjects() {
    document.getElementById("project-count").textContent =
        `${projects.length} PROJECTS`;

    projectList.innerHTML = projects.map((project, index) => `
        <a class="project" href="${escapeHTML(project.url)}" target="_blank" rel="noopener noreferrer">
            <span class="project-number">${String(index + 1).padStart(2, "0")}</span>
            <div class="project-info">
                <h3>${escapeHTML(project.name)}</h3>
                <p>${escapeHTML(project.description)}</p>
            </div>
            <span class="project-type">
                ${escapeHTML(project.type)}
                <span class="project-arrow">↗</span>
            </span>
        </a>
    `).join("");
}

renderProjects();

// ==========================================
// GITHUB PROFILE
// ==========================================

async function loadGitHubProfile() {
    try {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}`
        );

        if (!response.ok) throw new Error("Profile unavailable");

        const user = await response.json();

        document.getElementById("github-name").textContent =
            user.login;

        document.getElementById("github-bio").textContent =
            user.bio || "Independent developer and creator.";

    } catch (error) {
        document.getElementById("github-bio").textContent =
            "Unable to load GitHub profile.";
    }
}

// ==========================================
// GITHUB ACTIVITY
// ==========================================

async function loadGitHubActivity() {
    const container = document.getElementById("activity-list");

    try {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=10`
        );

        if (!response.ok) throw new Error("Activity unavailable");

        const events = await response.json();

        if (!events.length) {
            container.innerHTML =
                '<p class="loading">No recent public activity.</p>';
            return;
        }

        container.innerHTML = events.map(event => {
            const repo = event.repo?.name || "Unknown repository";
            const repoURL = `https://github.com/${repo}`;
            const date = new Date(event.created_at);

            let description = "Updated a repository";

            switch (event.type) {
                case "PushEvent": {
                    const commits = event.payload?.commits || [];
                    description = `Pushed ${commits.length} commit(s)`;
                    break;
                }
                case "CreateEvent":
                    description = `Created ${event.payload?.ref_type || "something"}`;
                    break;
                case "DeleteEvent":
                    description = `Deleted ${event.payload?.ref_type || "something"}`;
                    break;
                case "IssuesEvent":
                    description = `${event.payload?.action || "Updated"} an issue`;
                    break;
                case "PullRequestEvent":
                    description = `${event.payload?.action || "Updated"} a pull request`;
                    break;
                case "WatchEvent":
                    description = "Starred a repository";
                    break;
                case "ForkEvent":
                    description = "Forked a repository";
                    break;
                case "PublicEvent":
                    description = "Made a repository public";
                    break;
                case "ReleaseEvent":
                    description = "Published a release";
                    break;
            }

            return `
                <div class="activity">
                    <span class="activity-time">
                        ${escapeHTML(date.toLocaleDateString())}
                    </span>
                    <div class="activity-description">
                        <strong>${escapeHTML(description)}</strong>
                        · <a href="${escapeHTML(repoURL)}" target="_blank" rel="noopener noreferrer">${escapeHTML(repo)}</a>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        container.innerHTML =
            '<p class="loading">Could not retrieve GitHub activity.</p>';
    }
}

// ==========================================
// INITIALIZE
// ==========================================

loadGitHubProfile();
loadGitHubActivity();

// Refresh activity every 5 minutes.
setInterval(loadGitHubActivity, 300000);

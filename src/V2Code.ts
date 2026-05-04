export const CODE_GS = `const SHEET_ID = '1dVWL-JmxT452POX758Ua_E7n7-qI0xsyGRFfUnQsnj0'; // IMPORTANT: KEEP YOUR SHEET ID
const USERS_SHEET = 'Users';
const TASKS_SHEET = 'Tasks';

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Maxxis Rubber India PVT LTD - Task Manager')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheet(sheetName) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
}

function loginUser(username, password) {
  const sheet = getSheet(USERS_SHEET);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(username).trim() && String(data[i][2]).trim() === String(password).trim()) { 
      return { success: true, user: { id: data[i][0], username: data[i][1], role: data[i][3] } };
    }
  }
  return { success: false, message: 'Invalid username or password' };
}

function getTasks(userId, role) {
  const sheet = getSheet(TASKS_SHEET);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  let tasks = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    const rowAssignee = String(row[2]).trim();
    const currentUserId = String(userId).trim();
    
    if (role === 'Admin' || rowAssignee === currentUserId) {
      tasks.push({
        TaskID: row[0], Title: row[1], AssigneeID: row[2],
        Deadline: row[3] instanceof Date ? row[3].toISOString() : row[3],
        Recurrence: row[4], Status: row[5] || 'Pending'
      });
    }
  }
  return tasks;
}

function createTask(taskData) {
  const sheet = getSheet(TASKS_SHEET);
  const id = Utilities.getUuid();
  sheet.appendRow([id, taskData.title, taskData.assigneeId, taskData.deadline, taskData.recurrence, taskData.status || 'Pending']);
  return { success: true, message: 'Task created successfully' };
}

function updateTaskStatus(taskId, newStatus) {
  const sheet = getSheet(TASKS_SHEET);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === taskId) {
      sheet.getRange(i + 1, 6).setValue(newStatus);
      return { success: true, message: 'Status updated' };
    }
  }
  return { success: false, message: 'Task not found' };
}

function createUser(userData) {
  const sheet = getSheet(USERS_SHEET);
  const data = sheet.getDataRange().getValues();
  for(let i = 1; i < data.length; i++) {
    if(String(data[i][1]).trim() === String(userData.username).trim()) return { success: false, message: 'Username already exists' };
  }
  sheet.appendRow([Utilities.getUuid(), userData.username, userData.password, userData.role]);
  return { success: true, message: 'User created successfully' };
}

function getUsers() {
    const sheet = getSheet(USERS_SHEET);
    const data = sheet.getDataRange().getValues();
    const users = [];
    for (let i = 1; i < data.length; i++) {
        if(data[i][0]) users.push({ id: data[i][0], username: data[i][1], role: data[i][3] });
    }
    return users;
}`;

export const INDEX_HTML = `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body { padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; }
      .container { max-width: 1000px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      #dashboard, #admin-panel { display: none; }
      .task-card { border: 1px solid #edf2f7; padding: 20px; margin-bottom: 15px; border-radius: 8px; background: #fff; transition: box-shadow 0.2s; }
      .task-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.05); border-color:#cbd5e1; }
      
      .badge-Pending { background-color: #f59e0b; color: white; }
      .badge-In-Progress { background-color: #3b82f6; color: white; }
      .badge-Completed { background-color: #10b981; color: white; }
      .badge-Overdue { background-color: #ef4444; color: white; }
      
      .form-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #e9ecef; }
      .chart-container { height: 300px; width: 100%; margin-top: 20px; }
      .stat-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; text-align: center; height:100%; }
      .stat-value { font-size: 24px; font-weight: bold; color: #0d6efd; }
    </style>
  </head>
  <body>
    <div class="container" id="app">
      <div class="text-center mb-4 pb-3 border-bottom">
         <h2 class="fw-bold text-dark mb-0">Maxxis Rubber India PVT LTD</h2>
         <p class="text-muted">Production Task Manager</p>
      </div>
      
      <!-- === LOGIN SECTION === -->
      <div id="login-section" class="mx-auto mt-4" style="max-width: 400px;">
        <h4 class="mb-4 text-center fw-bold">System Login</h4>
        <div class="mb-3">
          <label class="form-label text-muted small fw-bold">Username</label>
          <input type="text" id="username" class="form-control" placeholder="Enter your User ID">
        </div>
        <div class="mb-4">
          <label class="form-label text-muted small fw-bold">Password</label>
          <input type="password" id="password" class="form-control" placeholder="Enter your password">
        </div>
        <button class="btn btn-primary w-100 py-2 fw-bold" onclick="login()">Sign In</button>
        <div id="login-error" class="text-danger mt-3 text-center small fw-bold"></div>
      </div>

      <!-- === DASHBOARD SECTION === -->
      <div id="dashboard">
        <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom flex-wrap gap-2">
          <h4 id="welcome-message" class="m-0 text-primary fw-bold"></h4>
          <button class="btn btn-outline-danger btn-sm fw-bold" onclick="logout()">Logout</button>
        </div>
        
        <!-- === ADMIN PANEL & DASHBOARD === -->
        <div id="admin-panel" class="mb-4">
          <h5 class="fw-bold mb-3">Admin Controls & Analytics</h5>
          <div class="mb-3">
             <button class="btn btn-primary btn-sm me-2 fw-bold" onclick="showCreateTaskForm()">+ Create Task</button>
             <button class="btn btn-secondary btn-sm fw-bold" onclick="showCreateUserForm()">+ Create User</button>
          </div>
          
          <!-- Create Task Form -->
          <div id="create-task-form" class="form-section" style="display:none;">
            <h6 class="fw-bold">Assign New Task</h6>
            <div class="row g-2 mt-2">
              <div class="col-md-6">
                 <input type="text" id="task-title" class="form-control" placeholder="Task Title / Description">
              </div>
              <div class="col-md-6">
                 <select id="task-assignee" class="form-select"></select>
              </div>
              <div class="col-md-6">
                 <input type="date" id="task-deadline" class="form-control">
              </div>
              <div class="col-md-6">
                 <select id="task-recurrence" class="form-select">
                  <option value="None">One-time (No Recurrence)</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                 </select>
              </div>
            </div>
            <button class="btn btn-success mt-3 fw-bold" onclick="createTask()">Dispatch Task</button>
            <button class="btn btn-light mt-3 border ms-2" onclick="closeForms()">Cancel</button>
          </div>
          
          <!-- Create User Form -->
          <div id="create-user-form" class="form-section" style="display:none;">
            <h6 class="fw-bold">Register User</h6>
            <div class="row g-2 mt-2">
              <div class="col-md-4">
                <input type="text" id="new-username" class="form-control" placeholder="Username (User ID)">
              </div>
              <div class="col-md-4">
                 <input type="password" id="new-password" class="form-control" placeholder="Password">
              </div>
              <div class="col-md-4">
                  <select id="new-role" class="form-select">
                      <option value="Staff">Staff</option>
                      <option value="Admin">Admin</option>
                  </select>
              </div>
            </div>
            <button class="btn btn-success mt-3 fw-bold" onclick="createUser()">Save User</button>
            <button class="btn btn-light mt-3 border ms-2" onclick="closeForms()">Cancel</button>
          </div>

          <!-- Analytics Dashboard -->
          <div class="row mt-4">
            <div class="col-12">
               <h6 class="fw-bold mb-3 border-bottom pb-2">Staff Productivity Dashboard</h6>
            </div>
            <div class="col-md-4 mb-3">
               <div class="stat-card">
                  <div class="text-muted small fw-bold text-uppercase">Total Tasks Overview</div>
                  <div class="stat-value text-primary" id="stat-total">0</div>
                  <span class="small text-muted" id="stat-pending">0 Pending</span>
               </div>
            </div>
            <div class="col-md-4 mb-3">
               <div class="stat-card">
                  <div class="text-muted small fw-bold text-uppercase">Most Productive Staff</div>
                  <div class="stat-value text-success" id="stat-best-staff">-</div>
               </div>
            </div>
            <div class="col-md-4 mb-3">
               <div class="stat-card">
                  <div class="text-muted small fw-bold text-uppercase">Company Achievement Rate</div>
                  <div class="stat-value text-info" id="stat-rate">0%</div>
               </div>
            </div>
            <div class="col-12">
               <div class="chart-container bg-light border rounded">
                  <canvas id="staffChart"></canvas>
               </div>
            </div>
          </div>
        </div>

        <!-- === TASKS LIST === -->
        <h5 class="fw-bold mt-4 mb-3" id="task-list-title">Your Work Queue</h5>
        <div id="tasks-container">Loading your tasks...</div>
      </div>
    </div>

    <script>
      let currentUser = null;
      let allUsersMap = {}; // ID to Username
      let staffChartInstance = null;

      function login() {
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        
        if(!user || !pass) return;

        document.getElementById('login-error').innerText = 'Authenticating...';
        
        google.script.run.withSuccessHandler(res => {
          if (res.success) {
            currentUser = res.user;
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('welcome-message').innerText = \`Hello, \${currentUser.username} (\${currentUser.role})\`;
            
            if (currentUser.role === 'Admin') {
              document.getElementById('admin-panel').style.display = 'block';
              document.getElementById('task-list-title').innerText = 'All Company Tasks';
              loadUsersAndTasks(); // Load users first for dropdown and analytics, then tasks
            } else {
              loadTasks(); // Staff only need their tasks
            }
          } else {
            document.getElementById('login-error').innerText = res.message;
          }
        }).loginUser(user, pass);
      }

      function logout() {
        currentUser = null;
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('login-error').innerText = '';
        if (staffChartInstance) staffChartInstance.destroy();
      }

      function closeForms() {
          document.getElementById('create-task-form').style.display = 'none';
          document.getElementById('create-user-form').style.display = 'none';
      }

      function checkOverdue(status, deadlineString) {
          if (status === 'Completed' || !deadlineString) return status;
          const deadline = new Date(deadlineString);
          const today = new Date();
          deadline.setHours(0,0,0,0);
          today.setHours(0,0,0,0);
          return deadline < today ? 'Overdue' : status;
      }

      function loadUsersAndTasks() {
          google.script.run.withSuccessHandler(users => {
             const select = document.getElementById('task-assignee');
             select.innerHTML = '<option value="">Select Staff Assignee...</option>';
             users.forEach(u => {
                 allUsersMap[u.id] = u.username;
                 select.innerHTML += \`<option value="\${u.id}">\${u.username} (\${u.role})</option>\`;
             });
             loadTasks(); 
          }).getUsers();
      }

      function loadTasks() {
        document.getElementById('tasks-container').innerHTML = '<div class="text-muted fw-bold">Loading tasks...</div>';
        
        google.script.run.withSuccessHandler(tasks => {
          const container = document.getElementById('tasks-container');
          container.innerHTML = '';
          
          if(tasks.length === 0) {
              container.innerHTML = '<p class="text-muted">No tasks found.</p>';
              if(currentUser.role === 'Admin') updateAnalytics([]);
              return;
          }
          
          let processedTasks = tasks.map(task => {
             task.currentStatus = checkOverdue(task.Status, task.Deadline);
             return task;
          });

          if (currentUser.role === 'Admin') {
             updateAnalytics(processedTasks);
          }
          
          processedTasks.forEach(task => {
            const isCompleted = task.currentStatus === 'Completed';
            const statusClass = task.currentStatus.replace(' ', '-');
            const deadlineDisplay = task.Deadline ? new Date(task.Deadline).toLocaleDateString() : 'No deadline';
            
            let adminContent = '';
            if (currentUser.role === 'Admin') {
                const assigneeName = allUsersMap[task.AssigneeID] || task.AssigneeID;
                adminContent = \`&bull; <strong class="text-dark">Assignee:</strong> \${assigneeName}\`;
            }

            container.innerHTML += \`
              <div class="task-card">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="mb-0 fw-bold text-dark">\${task.Title}</h6>
                  <span class="badge badge-\${statusClass} px-2 py-1">\${task.currentStatus}</span>
                </div>
                <div class="text-muted small mb-3">
                  <strong>Due:</strong> \${deadlineDisplay} &bull; 
                  <strong>Recurrence:</strong> \${task.Recurrence} 
                  \${adminContent}
                </div>
                
                \${!isCompleted ? \`
                  <div class="d-flex align-items-center bg-light p-2 rounded">
                    <span class="small me-2 text-muted fw-bold">Update Status:</span>
                    <select onchange="updateStatus('\${task.TaskID}', this.value)" class="form-select form-select-sm" style="width: 150px;">
                      <option value="" disabled selected>Mark as...</option>
                      \${task.currentStatus === 'Pending' ? '<option value="In Progress">In Progress</option>' : ''}
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                \` : '<div class="text-success small fw-bold px-2 py-1 bg-success bg-opacity-10 rounded d-inline-block">✔ Completed</div>'}
              </div>
            \`;
          });
        }).getTasks(currentUser.id, currentUser.role);
      }

      function updateAnalytics(tasks) {
         document.getElementById('stat-total').innerText = tasks.length;
         
         const staffStats = {};
         let totalCompleted = 0;
         let totalPending = 0;

         tasks.forEach(task => {
            const assigneeName = allUsersMap[task.AssigneeID] || task.AssigneeID || 'Unknown';
            if(!staffStats[assigneeName]) {
                staffStats[assigneeName] = { completed: 0, pending: 0, overdue: 0, total: 0 };
            }
            staffStats[assigneeName].total++;
            if(task.currentStatus === 'Completed') {
                staffStats[assigneeName].completed++;
                totalCompleted++;
            } else if(task.currentStatus === 'Overdue') {
                staffStats[assigneeName].overdue++;
                totalPending++;
            } else {
                staffStats[assigneeName].pending++;
                totalPending++;
            }
         });

         document.getElementById('stat-pending').innerText = \`\${totalPending} Pending/Overdue\`;

         const compRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;
         document.getElementById('stat-rate').innerText = compRate + '%';

         let bestStaff = 'None Yet';
         let highestRate = -1;
         let highestNum = 0;
         
         const labels = [];
         const completedData = [];
         const pendingData = [];
         const overdueData = [];

         for (const [staff, stats] of Object.entries(staffStats)) {
             labels.push(staff);
             completedData.push(stats.completed);
             pendingData.push(stats.pending);
             overdueData.push(stats.overdue);

             // Best staff logic 
             const staffRate = stats.total > 0 ? (stats.completed / (stats.total+0.001)) * 100 : 0;
             if(stats.completed > highestNum) {
                 highestNum = stats.completed;
                 highestRate = staffRate;
                 bestStaff = staff;
             }
         }

         document.getElementById('stat-best-staff').innerText = bestStaff;

         const ctx = document.getElementById('staffChart').getContext('2d');
         if(staffChartInstance) { staffChartInstance.destroy(); }
         
         staffChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Completed', data: completedData, backgroundColor: '#10b981' },
                    { label: 'Pending/In Progress', data: pendingData, backgroundColor: '#3b82f6' },
                    { label: 'Overdue', data: overdueData, backgroundColor: '#ef4444' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } }
                },
                plugins: {
                    title: { display: true, text: 'Task Distribution by Staff (Live Status)' }
                }
            }
         });
      }

      function updateStatus(taskId, status) {
        google.script.run.withSuccessHandler(res => {
          if (res.success) {
              loadTasks(); // Reload to refresh statuses & charts
          } else {
              alert(res.message);
          }
        }).updateTaskStatus(taskId, status);
      }
      
      function showCreateTaskForm() {
          document.getElementById('create-task-form').style.display = 'block';
          document.getElementById('create-user-form').style.display = 'none';
      }
      
      function showCreateUserForm() {
          document.getElementById('create-user-form').style.display = 'block';
          document.getElementById('create-task-form').style.display = 'none';
      }

      function createTask() {
        const data = {
          title: document.getElementById('task-title').value,
          assigneeId: document.getElementById('task-assignee').value,
          deadline: document.getElementById('task-deadline').value,
          recurrence: document.getElementById('task-recurrence').value
        };
        
        if(!data.title || !data.assigneeId) {
            alert("Title and Assignee are required!");
            return;
        }
        
        google.script.run.withSuccessHandler(res => {
          if (res.success) {
            alert('Task dispatched successfully!');
            document.getElementById('create-task-form').style.display = 'none';
            document.getElementById('task-title').value = '';
            document.getElementById('task-deadline').value = '';
            loadTasks(); // Refresh tasks and charts
          }
        }).createTask(data);
      }
      
      function createUser() {
          const data = {
             username: document.getElementById('new-username').value,
             password: document.getElementById('new-password').value,
             role: document.getElementById('new-role').value
          };
          
          if(!data.username || !data.password) {
              alert("Username and Password are required!");
              return;
          }
          
          google.script.run.withSuccessHandler(res => {
              if (res.success) {
                  alert(\`User \${data.username} created successfully!\`);
                  document.getElementById('create-user-form').style.display = 'none';
                  document.getElementById('new-username').value = '';
                  document.getElementById('new-password').value = '';
                  // Reload user mapping to include new user
                  if(currentUser.role === 'Admin') loadUsersAndTasks(); 
              } else {
                  alert(res.message);
              }
          }).createUser(data);
      }
    </script>
  </body>
</html>`;

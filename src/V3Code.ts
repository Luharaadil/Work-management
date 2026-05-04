export const CODE_GS = `const SHEET_ID = '1dVWL-JmxT452POX758Ua_E7n7-qI0xsyGRFfUnQsnj0'; 
const USERS_SHEET = 'Users'; // Cols: ID, Username, Password, Role, ManagerID
const TASKS_SHEET = 'Tasks'; // Cols: TaskID, Title, AssigneeID, Deadline, Recurrence, Status

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Maxxis Rubber India PVT LTD')
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
    // Basic auth check
    if (String(data[i][1]).trim() === String(username).trim() && String(data[i][2]).trim() === String(password).trim()) { 
      return { success: true, user: { id: data[i][0], username: data[i][1], role: data[i][3], managerId: data[i][4] } };
    }
  }
  return { success: false, message: 'Invalid username or password' };
}

function createUser(userData, managerId) {
  const sheet = getSheet(USERS_SHEET);
  const data = sheet.getDataRange().getValues();
  for(let i = 1; i < data.length; i++) {
    if(String(data[i][1]).trim() === String(userData.username).trim()) return { success: false, message: 'Username already exists' };
  }
  // Record the admin's ID as the ManagerID
  sheet.appendRow([Utilities.getUuid(), userData.username, userData.password, userData.role, managerId]);
  return { success: true, message: 'User created successfully under your management.' };
}

function getUsers(adminId, role) {
    const sheet = getSheet(USERS_SHEET);
    const data = sheet.getDataRange().getValues();
    const users = [];
    for (let i = 1; i < data.length; i++) {
        if(data[i][0]) {
            // Admins can only see people they created (ManagerID == adminId) OR themselves
            if (role !== 'Admin' || String(data[i][4]).trim() === String(adminId).trim() || String(data[i][0]).trim() === String(adminId).trim()) {
                users.push({ id: data[i][0], username: data[i][1], role: data[i][3] });
            }
        }
    }
    return users;
}

// Automatically processes past recurring tasks, flags missed ones, and spawns new instances
function processRecurringTasks() {
  const sheet = getSheet(TASKS_SHEET);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  const today = new Date();
  today.setHours(0,0,0,0);
  
  let rowsToUpdate = [];
  let newTasks = [];
  let existingTasksByTitle = {};
  
  for (let i = 1; i < data.length; i++) {
     const row = data[i];
     const id = row[0];
     if(id && row[4] && row[4] !== 'None') {
         if(!existingTasksByTitle[row[1]]) existingTasksByTitle[row[1]] = [];
         let d = new Date(row[3]);
         if (!isNaN(d.getTime())) {
             d.setHours(0,0,0,0);
             existingTasksByTitle[row[1]].push({ rowNum: i+1, deadline: d });
         }
     }
  }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const taskId = row[0];
    const title = row[1];
    const assignee = row[2];
    const deadlineString = row[3];
    const recurrence = row[4];
    const status = row[5];
    
    if (!taskId || !deadlineString) continue;

    const deadline = new Date(deadlineString);
    if (isNaN(deadline.getTime())) continue;
    deadline.setHours(0,0,0,0);

    // If task is in the past and not completed, flag as Missed automatically
    if (deadline < today && (status === 'Pending' || status === 'In Progress')) {
       rowsToUpdate.push({ rowIdx: i + 1, colIdx: 6, val: 'Missed' });
    }

    if (!recurrence || recurrence === 'None') continue;

    let allInstances = existingTasksByTitle[title] || [];
    let latestTaskDate = new Date(0);
    allInstances.forEach(inst => {
       if (inst.deadline > latestTaskDate) latestTaskDate = new Date(inst.deadline);
    });
    latestTaskDate.setHours(0,0,0,0);

    let nextDate = new Date(latestTaskDate);
    let limit = 0;
    
    // Spawn tasks until we catch up to today
    while (nextDate < today && limit < 365) { 
       if (recurrence === 'Daily') nextDate.setDate(nextDate.getDate() + 1);
       else if (recurrence === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
       else if (recurrence === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
       else break;
       
       // if we spawned a task that is already in the past, it's Missed
       let initStatus = (nextDate < today) ? 'Missed' : 'Pending';
       newTasks.push([Utilities.getUuid(), title, assignee, new Date(nextDate), recurrence, initStatus]);
       limit++;
    }
  }

  rowsToUpdate.forEach(upd => {
      sheet.getRange(upd.rowIdx, upd.colIdx).setValue(upd.val);
  });
  
  if (newTasks.length > 0) {
      sheet.getRange(data.length + 1, 1, newTasks.length, newTasks[0].length).setValues(newTasks);
  }
}

function getTasks(userId, role) {
  try {
    processRecurringTasks(); // Sync recurrence
  } catch(e) { } // Ignore errors for sync so it doesn't break fetch
  
  const sheet = getSheet(TASKS_SHEET);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  let subordinateIds = [];
  if (role === 'Admin') {
     const uData = getSheet(USERS_SHEET).getDataRange().getValues();
     for(let i=1; i<uData.length; i++) {
         if (String(uData[i][4]).trim() === String(userId).trim() || String(uData[i][0]).trim() === String(userId).trim()) {
             subordinateIds.push(String(uData[i][0]).trim());
         }
     }
  }

  let tasks = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    const rowAssignee = String(row[2]).trim();
    const currentUserId = String(userId).trim();
    
    // Show tasks only for staff managed by this admin, or own tasks
    if ((role === 'Admin' && subordinateIds.includes(rowAssignee)) || rowAssignee === currentUserId) {
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
`;

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
      .badge-Missed { background-color: #dc2626; color: white; }
      
      .form-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #e9ecef; }
      .chart-container { height: 300px; width: 100%; margin-top: 20px; }
      .stat-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; text-align: center; height: 100%; }
      .stat-value { font-size: 24px; font-weight: bold; color: #0d6efd; }
    </style>
  </head>
  <body>
    <div class="container" id="app">
      <div class="text-center mb-4 pb-3 border-bottom">
         <h2 class="fw-bold text-dark mb-0">Maxxis Rubber India PVT LTD</h2>
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
          <h5 class="fw-bold mb-3">Department Head / Admin Controls</h5>
          <div class="mb-3">
             <button class="btn btn-primary btn-sm me-2 fw-bold" onclick="showCreateTaskForm()">+ Assign Task</button>
             <button class="btn btn-secondary btn-sm fw-bold" onclick="showCreateUserForm()">+ Register Staff Member</button>
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
            <h6 class="fw-bold">Register User Under Your Management</h6>
            <p class="small text-muted mb-2">This staff member will be linked to you. You can assign and monitor their tasks.</p>
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
                      <option value="Admin">Admin (Dept Head)</option>
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
                  <div class="text-muted small fw-bold text-uppercase">Total Tasks Administered</div>
                  <div class="stat-value text-primary" id="stat-total">0</div>
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
                  <div class="text-muted small fw-bold text-uppercase">Overall Achievement Rate</div>
                  <div class="stat-value text-info" id="stat-rate">0%</div>
               </div>
            </div>

            <!-- Detailed Achievement Table -->
            <div class="col-12 mt-3">
               <h6 class="fw-bold mb-2 text-dark">Individual Staff Achievement & Records</h6>
               <p class="small text-muted mb-2">Tracks completion logic, missed recurring days, and overdue tasks comprehensively.</p>
               <div class="table-responsive border rounded">
                 <table class="table table-sm table-hover bg-white text-center mb-0">
                   <thead class="table-light">
                      <tr>
                         <th class="text-start ps-3">Staff Member</th>
                         <th>Completed</th>
                         <th>Pending / In-Progress</th>
                         <th>Overdue / Missed</th>
                         <th>Total Assigned</th>
                         <th>Achievement %</th>
                      </tr>
                   </thead>
                   <tbody id="achievement-table-body">
                   </tbody>
                 </table>
               </div>
            </div>

            <div class="col-12 mt-3">
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
              document.getElementById('task-list-title').innerText = 'Subordinate Tasks';
              loadUsersAndTasks(); // Load managed users first, then tasks
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
          if (status === 'Completed' || status === 'Missed' || !deadlineString) return status;
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
          }).getUsers(currentUser.id, currentUser.role);
      }

      function loadTasks() {
        document.getElementById('tasks-container').innerHTML = '<div class="text-muted fw-bold">Loading and compiling recurring tasks...</div>';
        
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

          // Sort tasks: Incomplete at top, completed/missed at bottom
          processedTasks.sort((a,b) => {
              const weights = { "Overdue": 1, "Pending": 2, "In Progress": 3, "Completed": 4, "Missed": 5 };
              let wA = weights[a.currentStatus] || 9;
              let wB = weights[b.currentStatus] || 9;
              return wA - wB;
          });

          if (currentUser.role === 'Admin') {
             updateAnalytics(processedTasks);
          }
          
          processedTasks.forEach(task => {
            const isCompletedOrMissed = task.currentStatus === 'Completed' || task.currentStatus === 'Missed';
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
                
                \${!isCompletedOrMissed ? \`
                  <div class="d-flex align-items-center bg-light p-2 rounded">
                    <span class="small me-2 text-muted fw-bold">Update Status:</span>
                    <select onchange="updateStatus('\${task.TaskID}', this.value)" class="form-select form-select-sm" style="width: 150px;">
                      <option value="" disabled selected>Mark as...</option>
                      \${task.currentStatus === 'Pending' || task.currentStatus === 'Overdue' ? '<option value="In Progress">In Progress</option>' : ''}
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                \` : \`<div class="\${task.currentStatus === 'Completed' ? 'text-success' : 'text-danger'} small fw-bold px-2 py-1 \${task.currentStatus === 'Completed' ? 'bg-success' : 'bg-danger'} bg-opacity-10 rounded d-inline-block">
                     \${task.currentStatus === 'Completed' ? '✔ Completed' : '✖ Missed / Unfulfilled'}
                     </div>\`}
              </div>
            \`;
          });
        }).getTasks(currentUser.id, currentUser.role);
      }

      function updateAnalytics(tasks) {
         document.getElementById('stat-total').innerText = tasks.length;
         
         const staffStats = {};
         let totalCompleted = 0;
         let totalPendingAndOverdue = 0;

         tasks.forEach(task => {
            const assigneeName = allUsersMap[task.AssigneeID] || task.AssigneeID || 'Unknown';
            if(!staffStats[assigneeName]) {
                staffStats[assigneeName] = { completed: 0, pending: 0, overdue: 0, missed: 0, total: 0 };
            }
            staffStats[assigneeName].total++;
            
            if(task.currentStatus === 'Completed') {
                staffStats[assigneeName].completed++;
                totalCompleted++;
            } else if(task.currentStatus === 'Overdue') {
                staffStats[assigneeName].overdue++;
                totalPendingAndOverdue++;
            } else if(task.currentStatus === 'Missed') {
                staffStats[assigneeName].missed++;
            } else {
                staffStats[assigneeName].pending++;
                totalPendingAndOverdue++;
            }
         });


         const compRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;
         document.getElementById('stat-rate').innerText = compRate + '%';

         let bestStaff = 'None Yet';
         let highestRate = -1;
         let highestNum = 0;
         
         const labels = [];
         const completedData = [];
         const pendingData = [];
         const missedData = [];
         
         const tableBody = document.getElementById('achievement-table-body');
         tableBody.innerHTML = '';

         for (const [staff, stats] of Object.entries(staffStats)) {
             labels.push(staff);
             completedData.push(stats.completed);
             pendingData.push(stats.pending + stats.overdue);
             missedData.push(stats.missed);

             const staffRate = stats.total > 0 ? Math.round((stats.completed / (stats.completed + stats.pending + stats.overdue + stats.missed)) * 100) : 0;
             
             tableBody.innerHTML += \`
                <tr>
                   <td class="fw-bold text-start ps-3">\${staff}</td>
                   <td class="text-success fw-bold">\${stats.completed}</td>
                   <td class="text-primary">\${stats.pending} / \${stats.overdue}</td>
                   <td class="text-danger fw-bold">\${stats.missed}</td>
                   <td>\${stats.total}</td>
                   <td class="fw-bold">\${staffRate}%</td>
                </tr>
             \`;

             // Determine best staff by completed magnitude
             if(stats.completed > highestNum) {
                 highestNum = stats.completed;
                 highestRate = staffRate;
                 bestStaff = staff;
             }
         }

         if (Object.keys(staffStats).length === 0) {
             tableBody.innerHTML = '<tr><td colspan="6" class="text-muted p-4">No task data available</td></tr>';
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
                    { label: 'Active / Overdue', data: pendingData, backgroundColor: '#3b82f6' },
                    { label: 'Missed Recurring Total', data: missedData, backgroundColor: '#ef4444' }
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
                    title: { display: true, text: 'Task Distribution & Compliance by Staff' },
                    tooltip: { mode: 'index', intersect: false }
                }
            }
         });
      }

      function updateStatus(taskId, status) {
        google.script.run.withSuccessHandler(res => {
          if (res.success) {
              loadTasks(); // Reload to refresh statuses
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
        
        if(!data.title || !data.assigneeId || !data.deadline) {
            alert("Title, Assignee AND Deadline are required!");
            return;
        }
        
        google.script.run.withSuccessHandler(res => {
          if (res.success) {
            alert('Task dispatched successfully!');
            document.getElementById('create-task-form').style.display = 'none';
            document.getElementById('task-title').value = '';
            document.getElementById('task-deadline').value = '';
            loadTasks(); 
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
          
          // Pass current user ID so the new user is linked under this Manager
          google.script.run.withSuccessHandler(res => {
              if (res.success) {
                  alert(res.message);
                  document.getElementById('create-user-form').style.display = 'none';
                  document.getElementById('new-username').value = '';
                  document.getElementById('new-password').value = '';
                  if(currentUser.role === 'Admin') loadUsersAndTasks(); 
              } else {
                  alert(res.message);
              }
          }).createUser(data, currentUser.id);
      }
    </script>
  </body>
</html>`;

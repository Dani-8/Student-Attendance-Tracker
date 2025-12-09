import { renderLoginForm, handleLogin } from './login.js';
import { renderDashboardView } from './dashboard.js';
import { renderAttendanceView } from './attendance.js';
import { CSVData, loadCSVData, todayDate, markAttendance } from './utils.js';

let currentView = 'login';
// ==================================================================================

export let navigateTo = (view) => {
    currentView = view
    renderApp();
}

// RENDER APP BASED ON CURRENT VIEW
export let renderApp = () => {
    let app = document.getElementById("app")

    if(currentView === "login"){
        app.innerHTML = renderLoginForm()
        document.getElementById("login-form").addEventListener("submit", handleLogin)
    }else if(currentView === "dashboard"){
        app.innerHTML = renderDashboardView()
    }else if(currentView === "attendance"){
        app.innerHTML = renderAttendanceView()
    }
}

// FILE UPLOAD HANDLER
window.handleFileSelect = (e) => {
    let file = e.target.files[0]
    let errorEl = document.getElementById("file-error")
    if (errorEl) errorEl.textContent = ''
    if (!file || !file.name.endsWith('.csv')) {
        if (errorEl) errorEl.textContent = 'Please select a valid CSV file.'
        return;
    }
    // -------------------------------------------------------------------------

    let render = new FileReader()
    render.onload = (e) => {
        let csvData = CSVData(e.target.result)
        // console.log(csvData);
        if(csvData.error){
            if (errorEl) errorEl.textContent = csvData.error
            return
        }

        loadCSVData(csvData)
        navigateTo('dashboard')
        renderApp()
    }
    render.readAsText(file)
}


window.markAttendance = markAttendance
window.navigateTo = navigateTo

renderApp()










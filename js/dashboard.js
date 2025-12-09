import { studentData, allDates, todayDate, calculateStats, renderAttendanceChart, renderRawDataTable } from "./utils.js";
import {isDataLoaded} from "./utils.js";

let selectedWeekRange = null;







export let renderDashboardView = () => {
    if(!isDataLoaded){
        return `
            <div class="loading-data-cont">
                <h1>Welcome, Teacher!</h1>
                <p class="desc">Your dashboard is empty because no student data has been loaded yet.</p>
                <svg class="mx-auto h-16 w-16 text-indigo-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>

                <label for="csv-file-input">
                    Load Student Data via CSV
                    <input type="file" id="csv-file-input" accept=".csv" onchange="window.handleFileSelect(event)">
                </label>
                <p id="upload-error" class="upload-error"></p>
            </div>
        `
    }
    // -------------------------------------------------------------------------------------------------------------------

    let stats = calculateStats()
    let { overallRate, todayAttendanceRate, needsAttention, top10Students, totalPossibleCount } = stats

    let html = `
        <div class="dashboard-cont">
            <header class="dashboard-header">
                <div><h1>Class Dashboard</h1><p>Data loaded from CSV file.</p></div>
                <button class="dashboard-header-btn" onclick="navigateTo('attendance')">Mark Today's Attendance</button>
            </header>

            <div class="kpis-cont">
                <div><p class="kpi-heading">Total Students</p><p class="kpi-number">${stats.totalStudents}</p></div>
                <div><p class="kpi-heading">Today's Rate</p><p class="kpi-number">${todayAttendanceRate}%</p></div>
                <div><p class="kpi-heading">Overall Rate</p><p class="kpi-number">${overallRate}%</p></div>
                <div><p class="kpi-heading">Needs Attention</p><p class="kpi-number">${needsAttention.length}</p></div>
            </div>

            <div class="attendance-performance-cont">
                <h1>Overall Attendance Performance</h1>
                <div class="attendanceChart" id="attendanceChartCont"><canvas id="attendanceChart"></canvas></div>
            </div>

            <div class="frequent-absences-cont">
                <h1>Students with Frequent Absences (>2 Days)</h1>
                ${needsAttention.length === 0 ? `<p class="no-data">No students with frequent  absences.</p>` : `
                    <table class="table">
                        <thead><tr>
                            <th>Student Name</th>
                            <th>Student ID</th>
                            <th class="absences-heading">Total Absences</th>
                        </tr></thead>
                        <tbody id="freqAbsencesTbody">
                        <tr>
                            ${needsAttention.map(student => `
                                <tr>
                                    <td>${student.name}</td>
                                    <td>${student.id}</td>
                                    <td class="absences-number">${student.absentCount}/${totalPossibleCount}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `}
            </div>

            ${renderRawDataTable()}
        </div>
    `


    setTimeout(() => renderAttendanceChart(stats.top10Students), 0);
    return html;
}

















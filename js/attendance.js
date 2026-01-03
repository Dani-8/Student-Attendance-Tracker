import { studentData, attendanceRecords, todayDate, isDataLoaded, markAttendance } from "./utils.js"
import { navigateTo } from "./app.js"

// RENDER ATTENDANCE VIEW
export let renderAttendanceView = () => {
    if(!isDataLoaded){
        navigateTo("dashboard")
        return ''
    }
    // ----------------------------------

    let todayRecords = studentData.map(student => {
        let status = attendanceRecords[student.id][todayDate] || "Not Marked"
        return { ...student, status }
    })
    // ----------------------------------

    return `
        <div class="student-attendance-record">
            <header class="header">
                <div><h1 class="text-3xl font-bold text-gray-800">Mark Attendance</h1><p class="text-lg text-gray-500">Class: 100 | Date: ${todayDate}</p></div>
                <button  onclick="navigateTo('dashboard')" class="view-attendance-btn" id="view-attendance-btn">Back to Dashboard</button>
            </header>

            <div class="attendance-record-cont">
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Student ID</th>
                                <th class="record-status-heading">Attendance Status</th>
                                <th class="record-action-heading">Action</th>
                            </tr>
                        </thead>
                        <tbody id="attendance-tbody">
                            ${todayRecords.map(record => {
                                const savedStatus = attendanceRecords[record.id]?.[todayDate] || 'U';
                                const pBtnClass = savedStatus === 'P' ? 'mark-attendance-btn marked-present-btn-active' : 'mark-attendance-btn mark-present-btn-default';
                                const aBtnClass = savedStatus === 'A' ? 'mark-attendance-btn marked-absent-btn-active' : 'mark-attendance-btn mark-absent-btn-default';

                                return `
                                    <tr data-id="${record.id}">
                                        <td class="record-nama">${record.name}</td>
                                        <td class="record-id">${record.id}</td>
                                        <td class="record-status">
                                            <span id="status-${record.id}" class="status-block ${savedStatus === 'P' ? 'status-present' : savedStatus === 'A' ? 'status-absent' : 'status-unmarked'}">
                                                ${savedStatus === 'P' ? 'Present' : savedStatus === 'A' ? 'Absent' : 'Unmarked'}
                                            </span>
                                        </td>
                                        <td class="record-action">
                                            <button onclick="markAttendance('${record.id}', 'P')" class="${pBtnClass}">Mark P</button>
                                            <button onclick="markAttendance('${record.id}', 'A')" class="${aBtnClass}">Mark A</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
}



































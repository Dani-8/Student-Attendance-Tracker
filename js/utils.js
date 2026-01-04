import { navigateTo } from "./app.js"

export let todayDate = (() => {
    let d = new Date
    let twoDigits = n => n < 10 ? `0${n}`: n

    return `${twoDigits(d.getDate())}/${twoDigits(d.getMonth() + 1)}/${d.getFullYear()}`
})()

// console.log(todayDate)
// ---------------------------------------------------

export let studentData = []
export let attendanceRecords = {}
export let isDataLoaded = false
export let allDates = []
// --------------------------------

export let CSVData = (csv) => {
    let lines = csv.split("\n").filter(line => line.trim() !== "")
    // console.log("🚀 ~ CSVData ~ lines:", lines[0])
    if(lines.length <= 1) return {studentData: [], attendanceRecords: {}, allDates: [], error: "CSV file is empty or invalid."}

    let headers = lines[0].split(",").map(h => h.trim())
    let dateHeaders = headers.slice(2)
    // console.log(dateHeaders)
    
    let students = []
    let attendanceRecords = {}
    let allDates = new Set()

    for(let i = 1; i < lines.length; i++){
        let values = lines[i].split(",").map(v => v.trim())

        if(values.length < headers.length){
            return {studentData: [], attendanceRecords: {}, allDates: [], error: `Data format error on line ${i + 1}.`}
        }

        let studentId = values[0] 
        let studentName = values[1] || values[0] || `Unknown`

        if(!studentId) studentId = `S${i}`

        studentData.push({ id: studentId, name: studentName })
        attendanceRecords[studentId] = {}  

        dateHeaders.forEach((date, index) => {
            let status = values[index + 2] || ""
            if(status){
                attendanceRecords[studentId][date] = status
                allDates.add(date)
            }
        })
    }
    // ----------------------------------------------------------------

    if(studentData.length === 0){
        return {studentData: [], attendanceRecords: {}, allDates: [], error: "No student data found in the CSV."}
    }

    // ---------------------------------------------------------------

    let sortedDates = [...allDates].sort((a, b) => {
        let [d1,m1,y1] = a.split("/")
        let [d2,m2,y2] = b.split("/")
        
        return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`) 
    })

    return {studentData, attendanceRecords, allDates: sortedDates}
}
// -------------------------------------------------------------------------


export let loadCSVData = (data) => {
    studentData = data.studentData
    attendanceRecords = data.attendanceRecords
    allDates = data.allDates
    isDataLoaded = true
}
// -------------------------------------------------

/**
 * ===================
 * EXPORT DATA TO CSV
 * ===================
 */

window.exportDataToCSV = () => {
    if (studentData.length === 0) return alert("No data to export");

    let sortedDates = [...allDates].sort((a, b) => {
        let [d1,m1,y1] = a.split("/")
        let [d2,m2,y2] = b.split("/")
        
        return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`) 
    })
    // ----------------------------------------------------------------------

    let csv = `Student ID, Student Name, ${sortedDates.join(",")}\n`

    studentData.forEach(s => {
        let row = [s.id, `"${s.name.replace(/"/g, '""')}"`]
        sortedDates.forEach(d => {
            row.push(attendanceRecords[s.id][d] || '-')
        })
        csv += row.join(',') + "\n"
    })
    // ----------------------------------------------------------------------


    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_data_${todayDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
// ----------------------------------------------------------------------------

/**
 * ===============
 * MARK ATTENDANCE
 * ===============
 */

export let markAttendance = (studentId, status) => {
    let statusEl = document.getElementById(`status-${studentId}`)
    if(statusEl){
        statusEl.textContent = status === "P" ? "Present" : status === "A" ? "Absent" : "Unmarked";
        statusEl.classList.remove("status-present","status-absent","status-unmarked");
        statusEl.classList.add(status === "P" ? "status-present" : status === "A" ? "status-absent" : "status-unmarked");
    }
    // -------------------------------------------------------------------

    let row = statusEl.closest("tr");
    let pBtn = row.querySelector(".mark-attendance-btn.mark-present-btn-default, .marked-present-btn-active");
    let aBtn = row.querySelector(".mark-attendance-btn.mark-absent-btn-default, .marked-absent-btn-active");


    pBtn.classList.remove("marked-present-btn-active");
    pBtn.classList.add("mark-present-btn-default");

    aBtn.classList.remove("marked-absent-btn-active");
    aBtn.classList.add("mark-absent-btn-default");


    if (status === "P") {
        pBtn.classList.remove("mark-present-btn-default");
        pBtn.classList.add("marked-present-btn-active");
    } else if (status === "A") {
        aBtn.classList.remove("mark-absent-btn-default");
        aBtn.classList.add("marked-absent-btn-active");
    }
    // ----------------------------------------------------------

    
    if (!attendanceRecords[studentId]) attendanceRecords[studentId] = {};
    attendanceRecords[studentId][todayDate] = status;

    if(!allDates.includes(todayDate)){
        allDates.push(todayDate)
        allDates.sort((a, b) => {
            const [d1, m1, y1] = a.split('/');
            const [d2, m2, y2] = b.split('/');
            return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
        });
    }
}
// --------------------------------------------------------------------------------------

let selectedWeekRange = null


let standardizeDate = (date) => {
    let [d, m, y] = date.split("/")
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
}
// console.log(standardizeDate(todayDate));


let getWeeksRange = () => {
    if(allDates.length === 0) return []

    let sortedDates = [...allDates].sort((a, b) => {
        return new Date(standardizeDate(a)) - new Date(standardizeDate(b))
    })  

    let firstDate = new Date(standardizeDate(sortedDates[0]))
    let lastDate = new Date(standardizeDate(sortedDates[sortedDates.length - 1]))

    // Start from Monday of first week
    let start = new Date(firstDate)
    start.setDate(firstDate.getDate() - firstDate.getDay() + 1)
    // -----------------------------------------------------------------------------


    let range = []
    let current = new Date(start)

    while(current <= lastDate){
        let weekEnd = new Date(current)
        weekEnd.setDate(current.getDate() + 6)
    
        
        let weekDates = sortedDates.filter(d => {
            let dt = new Date(standardizeDate(d))
            return dt >= current && dt <= weekEnd
        })
        
        if(weekDates.length > 0){
            range.push({
                start: current.toISOString().slice(0, 10),
                end: weekEnd.toISOString().slice(0, 10),
                date: weekDates,
                label: `Week ${range.length + 1}`
            })
        }
    
        current.setDate(current.getDate() + 7)
    }

    return range
}




let isDateInSelectedWeek = (date) => {
    if(!selectedWeekRange) return true

    let std = standardizeDate(date)
    return std >= selectedWeekRange.start && std <= selectedWeekRange.end
}

export let getVisibleDates = () => {
    return allDates.filter(isDateInSelectedWeek)
}



export let renderWeekFilterButtons = () => {
    let weeks = getWeeksRange()
    if(weeks.length === 0) return `<div class="week-filter-btns-cont"><button onclick="setSelectedWeek(null)" class="week-btn active">All</button></div>`

    let html = `
        <div class="week-filter-btns-cont">
            <button onclick="setSelectedWeek(null)" class="week-btn ${!selectedWeekRange ? 'active' : ''}">All</button>`   

    weeks.forEach((w, i) => {
        let active = selectedWeekRange && selectedWeekRange.start === w.start
        let startLabel = w.date[0].split("/").slice(0,2).join('/')
        let endLabel = w.date[w.date.length-1].split("/").slice(0,2).join('/')


        html += `
            <button onclick="setSelectedWeek('${w.start}', '${w.end}')" class="week-btn ${active ? 'active' : ''}">
                Week ${i+1}: ${startLabel} - ${endLabel}
            </button>
        `
    })


    html += `</div>`;
    return html;
}




window.setSelectedWeek = (start, end) => {
    selectedWeekRange = start ? {start, end} : null
    navigateTo('dashboard')
}


// --------------------------------------------------------------------------------------
/**
 * ==============
 * ADD STUDENTS
 * =============
 */

export let addStudent = (id, name) => {
    if (!id || !name)
        return { success: false, message: "ID and Name required" }

    if (studentData.some(s => s.id === id))
        return {success: false, message: "ID already exists"}
    // -----------------------------------------------------------------

    let newStudent = {id, name}
    studentData.push(newStudent)
    attendanceRecords[id] = {}
    studentData.sort((a, b) => a.name.localeCompare(b.name))
    isDataLoaded = true

    return {success: true, message: `Student ${name} (${id}) added successfully...`}
}
// --------------------------------------------------------------------------------------


/**
 * =====================
 * CALCULATE STATS
 * =====================
 */

export let calculateStats = () => {
    let studentAttendanceStats = []
    let totalPresentCount = 0
    let totalPossibleCount = 0
    let studentAbsentCounts = {}
    let todayPresentCount = 0
    // ------------------------------

    let visibleDates = getVisibleDates();
    let allUniqueDates = new Set(visibleDates);

    if (studentData.length > 0 && !allUniqueDates.has(todayDate) && visibleDates.includes(todayDate)) {
        allUniqueDates.add(todayDate);
    }
    // --------------------------------------------

    totalPossibleCount = allUniqueDates.size
    let totalStudentsCount = studentData.length


    studentData.forEach(student => {
        let attendance = attendanceRecords[student.id] || {}
        let studentPresent = 0
        let absentCount = 0

        allUniqueDates.forEach(date => {
            let status = attendance[date] || ""

            if(status === "P"){
                studentPresent++
                totalPresentCount++
                if(date === todayDate){
                    todayPresentCount++
                }
            }else if(status === "A"){
                absentCount++
                // console.log("🚀 ~ calculateStats ~ absentCount:", absentCount)
                studentAbsentCounts[student.id] = (studentAbsentCounts[student.id]  || 0) + 1
            }
        })
        // ------------------------------------------------

        let attendanceRate = totalPossibleCount > 0 ? (studentPresent / totalPossibleCount) * 100 : 0
        // console.log("🚀 ~ calculateStats ~ attendanceRate:", attendanceRate)

        studentAttendanceStats.push({
            ...student,
            presentDay: studentPresent,
            absentCount: studentAbsentCounts[student.id] || 0,
            totalDays: totalPossibleCount,
            attendanceRate: Math.round(attendanceRate)
        })
    })
    // -------------------------------------------------

    // console.log("🚀 ~ calculateStats ~ totalPresentCount:", totalPresentCount)
    
    let overallRate = totalPossibleCount > 0 && totalStudentsCount > 0 ? 
        Math.round((totalPresentCount / (totalStudentsCount * totalPossibleCount)) * 100) 
        : 0 

    let todayAttendanceRate = totalStudentsCount > 0 && totalStudentsCount > 0 ?
        Math.round((todayPresentCount / totalStudentsCount) * 100)
        : 0

    let needsAttention = studentAttendanceStats
        .filter(stat => stat.absentCount > 2)
        .sort((a, b) => b.absentCount - a.absentCount)
    // console.log("🚀 ~ calculateStats ~ needsAttention:", needsAttention)
    
    let top10Students = studentAttendanceStats
        .sort((a, b) => b.attendanceRate - a.attendanceRate)
        .slice(0, 10)


    return { totalStudents: studentData.length, overallRate, todayAttendanceRate, needsAttention, top10Students, totalPossibleCount }
}
// -----------------------------------------------------------------------------------------------------------------


/**
 * =====================
 * RENDER ATTENDANCE CHART
 * =====================
 */

export let renderAttendanceChart = (topStudents) => {
    let ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    // ------------------------------
    let labels = topStudents.map(student => student.name.split(" ")[0]);

    let data = topStudents.map(student => student.attendanceRate);

    let backgroundColors = data.map(rate =>
        rate >= 90 ? '#34D399' : rate >= 70 ? '#FBBF24' : '#F87171'
    );

    // ------------------------------
    // Destroy previous chart
    if (window.attendanceChartInstance) {
        window.attendanceChartInstance.destroy();
    }

    // ------------------------------
    window.attendanceChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Attendance Rate (%)",
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(c => c.replace('100', '00')),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: "Attendance Percentage"
                    }
                },
                x: {
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: topStudents.length > 0 
                        ? `Top ${topStudents.length} Students by Attendance`
                        : "No Students to Display",
                    font: { size: 16, weight: "bold" }
                },
                tooltip: {
                    callbacks: {
                        label: 
                            function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.y + '%';
                                return label;
                            }
                        }
                }
            }
        }
    });
};

/**
 * =====================
 * RENDER TABLE
 * =====================
 */

export let generateRawTableBody = (students) => {
    return students.map(student => {
        let studentRecords = attendanceRecords[student.id] || {}
        let dateCells = getVisibleDates().sort((a,b) => {
            let [d1,m1,y1] = a.split('/')
            let [d2,m2,y2] = b.split('/')
            return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`)
        }).map(date => {
            let status = studentRecords[date] || "-"
            return `<td style="font-size:14px; color: ${status === 'P' ? '#10B981' : status === 'A' ? '#EF4444' : '#6B7280'}; font-weight: bold;" class="date-data status-${status}">${status}</td>`
        }).join("")
        // console.log("🚀 ~ generateRawTableBody ~ allDates:", allDates)

        return `
            <tr>
                <td class="raw-table-data-name name-col">${student.name}</td>
                <td class="raw-table-data-id id-col">${student.id}</td>
                ${dateCells}
            </tr>
        `

    }).join("")
}
window.generateRawTableBody = generateRawTableBody
// ----------------------------------------------------------------

/**
 * ========================
 * RENDER FILTER + RAW DATA
 * ========================
 */

window.filterAndRenderRawData = () => {
    let searchInput = document.getElementById("student-search-raw").value.toLowerCase()
    let statusFilter = document.getElementById("student-filter-raw").value


    let filteredStudent = studentData.filter(student => {
        let studentId = student.id.toLowerCase()
        let studentName = student.name.toLowerCase()

        // first search filter:
        let matchesSearch = studentName.includes(searchInput) || studentId.includes(statusFilter)
        if(!matchesSearch) return false

        // sencond status filter
        if (statusFilter === 'All') return true;

        let studentRecords = attendanceRecords[student.id] || {}
        // console.log(studentRecords);
        
        let hasStatus = Object.values(studentRecords).some(status => 
            statusFilter === "-" ? status === "" : status === statusFilter
        )

        if(statusFilter === "-" && !hasStatus){
            let dateWithStatus = Object.keys(studentRecords)
            let isUnmarkedOnAnyDate = allDates.some(date => !dateWithStatus.includes(date) || studentRecords[date] === "-")

            return matchesSearch && isUnmarkedOnAnyDate
        }

        return hasStatus
    })


    let tableBody = document.getElementById("raw-data-table-body")
    if(tableBody){
        tableBody.innerHTML = generateRawTableBody(filteredStudent)
    }
}
// ---------------------------------------------------------------------------------------

/**
 * =====================
 * RENDER RAW DATA TABLE
 * =====================
 */


export let renderRawDataTable = () => {
    let headerRows = `
        <tr>
            <th class="raw-table-data-header-name name-col">Student Name</th>
            <th class="raw-table-data-header-id id-col">Student ID</th>
            ${getVisibleDates().sort((a,b) => {
                let [d1,m1,y1] = a.split('/')
                let [d2,m2,y2] = b.split('/')
                return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`)
            }).map(date => `<th class="date-data">${date}</th>`).join('')}
        </tr>
    `
    // --------------------------------------------

    return `
        <div class="render-table-and-filter-cont">
            <h1>Raw Attendance Data (Spreadsheet View)</h1>

            <div class="filter-items-cont">
                <input id="student-search-raw" oninput="filterAndRenderRawData()" type="text" placeholder="Search by Name or ID...">
                <select id="student-filter-raw" onchange="filterAndRenderRawData()" name="" id="">
                    <option value="All">Filter by Status (Any Day)</option>
                    <option value="P">Present (P)</option>
                    <option value="A">Absent (A)</option>
                    <option value="-">Unmarked (-)</option>
                </select>
            </div>

            <div class="table-cont">
                <table class="table">
                    <thead><tr>
                        ${headerRows}
                    </tr></thead>
                    <tbody id="raw-data-table-body"><tr>${generateRawTableBody(studentData)}</tr></tbody>
                </table>
            </div>
        </div>
    `

}
// -------------------------------------------------------------------------------
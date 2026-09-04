/* =========================================================
   UNIVERSITY AUTOMATIC TIMETABLE SYSTEM
   STEP 3 - JAVASCRIPT
========================================================= */

/* =========================================================
   FIREBASE CONNECTION
========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyDbaoycs6GwAsNLl_eOJO_BT6xpMl3GaZE",
    authDomain: "timetable-e823f.firebaseapp.com",
    projectId: "timetable-e823f",
    storageBucket: "timetable-e823f.firebasestorage.app",
    messagingSenderId: "162078880622",
    appId: "1:162078880622:web:701f4426ba744ea4a1477f",
    measurementId: "G-MGX56N6YTT"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

/* =========================================================
   1. LOGIN
   Firebase Authentication handles email/password login.
========================================================= */


/* =========================================================
   2. APPLICATION DATA
========================================================= */

let teachers = [];
let subjects = [];
let rooms = [];
let timetable = [];


/* =========================================================
   3. DAYS AND TIME SLOTS
========================================================= */

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];


const timeSlots = [
    { start:"09:00", end:"09:15", label:"09:00 AM - 09:15 AM", type:"meditation" },
    { start:"09:15", end:"10:15", label:"09:15 AM - 10:15 AM" },
    { start:"10:15", end:"11:15", label:"10:15 AM - 11:15 AM" },
    { start:"11:15", end:"11:30", label:"11:15 AM - 11:30 AM", type:"shortBreak" },
    { start:"11:30", end:"12:30", label:"11:30 AM - 12:30 PM" },
    { start:"12:30", end:"13:30", label:"12:30 PM - 01:30 PM" },
    { start:"13:30", end:"14:15", label:"01:30 PM - 02:15 PM", type:"lunch" },
    { start:"14:15", end:"15:15", label:"02:15 PM - 03:15 PM" },
    { start:"15:15", end:"16:15", label:"03:15 PM - 04:15 PM" }
];


/* =========================================================
   4. LOAD SAVED DATA
========================================================= */

/* =========================================================
   4. LOAD DATA FROM FIREBASE
========================================================= */

async function loadData() {

    try {

        // The timetable remains shared for all authenticated users.
        // Authentication controls access; Firestore stores the university data.
        const dataRef = doc(db, "timetableSystem", "mainData");

        const dataSnapshot = await getDoc(dataRef);


        if (dataSnapshot.exists()) {

            const data = dataSnapshot.data();


            teachers = data.teachers || [];

            subjects = data.subjects || [];

            rooms = data.rooms || [];

            timetable = data.timetable || [];


            console.log("✅ Data loaded from Firebase.");

        } else {

            console.log("ℹ️ No data found in Firebase. Starting empty.");

            teachers = [];

            subjects = [];

            rooms = [];

            timetable = [];

        }

    } catch (error) {

        console.error(
            "❌ Error loading data from Firebase:",
            error
        );

        alert(
            "Unable to load data from Firebase. Please check your internet connection."
        );

    }

}


/* =========================================================
   5. SAVE DATA
========================================================= */

/* =========================================================
   5. SAVE DATA TO FIREBASE
========================================================= */

async function saveData() {

    try {

        const dataRef = doc(
            db,
            "timetableSystem",
            "mainData"
        );


        await setDoc(
            dataRef,
            {
                teachers: teachers,
                subjects: subjects,
                rooms: rooms,
                timetable: timetable
            }
        );


        console.log("✅ Data saved to Firebase.");

    } catch (error) {

        console.error(
            "❌ Error saving data to Firebase:",
            error
        );

        alert(
            "Unable to save data to Firebase. Please check your internet connection."
        );

    }

}


/* =========================================================
   6. PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Set up the UI first. Data is loaded only after Firebase
        // confirms that a user is authenticated.
        setupLogin();

        setupTeacherForm();

        setupSubjectForm();

        setupRoomForm();

        setupAssignmentForm();
        setupAssignmentTimeBySubject();
document.getElementById("assignmentYear")
    .addEventListener(
        "change",
        populateSubjectDropdown
    );


document.getElementById("assignmentSemester")
    .addEventListener(
        "change",
        populateSubjectDropdown
    );
        setupNavigation();

        onAuthStateChanged(auth, async function (user) {

            if (user) {

                document.getElementById("loginPage").hidden = true;
                document.getElementById("mainApplication").hidden = false;
                document.getElementById("loginMessage").innerText = "";

                await loadData();

                updateDashboard();
                populateTeacherDropdown();
                populateSubjectDropdown();
                populateRoomSubjectDropdown();
                populateRoomDropdown();
                populateAssignmentTeacherDropdown();
                displayTeachers();
                displaySubjects();
                displayRooms();
                displayTimetable();

                showSection("dashboardSection");

            } else {

                document.getElementById("loginPage").hidden = false;
                document.getElementById("mainApplication").hidden = true;

                teachers = [];
                subjects = [];
                rooms = [];
                timetable = [];

            }

        });

    }
);


/* =========================================================
   7. LOGIN
========================================================= */

function setupLogin() {

    const loginForm =
        document.getElementById("loginForm");


    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            login();

        }
    );

}


async function login() {

    const email =
        document.getElementById("username")
            .value
            .trim();

    const password =
        document.getElementById("password")
            .value;

    const message =
        document.getElementById("loginMessage");

    if (!email || !password) {
        message.innerText = "❌ Please enter your email and password.";
        return;
    }

    message.innerText = "Signing in...";

    try {

        await signInWithEmailAndPassword(auth, email, password);

        // onAuthStateChanged() handles opening the application and loading data.
        message.innerText = "";

    } catch (error) {

        console.error("Firebase login error:", error);

        if (error.code === "auth/invalid-credential" ||
            error.code === "auth/wrong-password" ||
            error.code === "auth/user-not-found") {
            message.innerText = "❌ Invalid email or password.";
        } else if (error.code === "auth/too-many-requests") {
            message.innerText = "❌ Too many login attempts. Please try again later.";
        } else {
            message.innerText = "❌ Login failed. Please try again.";
        }

    }

}


/* =========================================================
   8. LOGOUT
========================================================= */

async function logout() {

    try {
        await signOut(auth);

        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        document.getElementById("loginMessage").innerText = "";

    } catch (error) {

        console.error("Firebase logout error:", error);
        alert("Unable to log out. Please try again.");

    }

}


/* =========================================================
   9. NAVIGATION
========================================================= */

function setupNavigation() {

    document.getElementById("dashboardButton")
        .addEventListener(
            "click",
            () => showSection("dashboardSection")
        );


    document.getElementById("teachersButton")
        .addEventListener(
            "click",
            () => showSection("teacherSection")
        );


    document.getElementById("subjectsButton")
        .addEventListener(
            "click",
            () => showSection("subjectSection")
        );


    document.getElementById("roomsButton")
        .addEventListener(
            "click",
            () => showSection("roomSection")
        );


    document.getElementById("timetableButton")
        .addEventListener(
            "click",
            () => showSection("timetableSection")
        );

    
    document.getElementById("resetButton")
        .addEventListener(
            "click",
          resetSystem
    );



    document.getElementById("logoutButton")
        .addEventListener(
            "click",
            logout
        );


    document.getElementById("generateButton")
        .addEventListener(
            "click",
            generateAutomaticTimetable
        );


    document.getElementById("downloadButton")
        .addEventListener(
            "click",
            downloadTimetable
        );


    document.getElementById("printButton")
        .addEventListener(
            "click",
            printTimetable
        );

}


function showSection(sectionId) {

    const sections = [

        "dashboardSection",

        "teacherSection",

        "subjectSection",

        "roomSection",

        "assignmentSection",

        "timetableSection"

    ];


    sections.forEach(
        id => {

            const section =
                document.getElementById(id);

            if (section) {

                section.hidden =
                    id !== sectionId;

            }

        }
    );


    if (
        sectionId === "subjectSection"
    ) {

        populateTeacherDropdown();

    }


    if (
        sectionId === "assignmentSection"
    ) {

        populateSubjectDropdown();

        populateAssignmentTeacherDropdown();

        populateRoomDropdown();

    }


    if (
        sectionId === "timetableSection"
    ) {

        displayTimetable();

    }

}


/* =========================================================
   10. TEACHER MANAGEMENT
========================================================= */

function setupTeacherForm() {

    const form =
        document.getElementById("teacherForm");


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            addTeacher();

        }
    );

}


async function addTeacher() {
    const id =
        document.getElementById("teacherId")
            .value
            .trim();

    const name =
        document.getElementById("teacherName")
            .value
            .trim();

    const email =
        document.getElementById("teacherEmail")
            .value
            .trim();

    const department =
        document.getElementById("teacherDepartment")
            .value
            .trim();


    if (!id || !name) {

        alert(
            "Please enter Teacher ID and Teacher Name."
        );

        return;

    }


    const duplicate =
        teachers.some(
            teacher =>
                teacher.id.toLowerCase() ===
                id.toLowerCase()
        );


    if (duplicate) {

        alert(
            "Teacher ID already exists."
        );

        return;

    }


    teachers.push({

        id: id,

        name: name,

        email: email,

        department: department

    });


    await saveData();

    displayTeachers();

    populateTeacherDropdown();

    populateAssignmentTeacherDropdown();

    updateDashboard();


    document.getElementById("teacherForm")
        .reset();


    alert(
        "Teacher added successfully."
    );

}


function displayTeachers() {

    const tbody =
        document.getElementById(
            "teacherTableBody"
        );


    tbody.innerHTML = "";


    if (teachers.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="4">

                    No teachers registered.

                </td>

            </tr>

        `;

        return;

    }


    teachers.forEach(
        (teacher, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHTML(teacher.id)}
                </td>

                <td>
                    ${escapeHTML(teacher.name)}
                </td>

                <td>
                    ${escapeHTML(teacher.email || "-")}
                </td>

                <td>
                    ${escapeHTML(
                        teacher.department || "-"
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="delete-button"
                        onclick="${index}">

                        Delete

                    </button>

                </td>

            `;


            tbody.appendChild(row);
            const deleteButton = row.querySelector(".delete-button");

            deleteButton.addEventListener("click", function () {
            deleteTeacher(index);
            });

        }
    );

}


async function deleteTeacher(index) {

    const teacher = teachers[index];

    if (!teacher) {
        return;
    }

    if (
        !confirm(
            `Delete teacher "${teacher.name}"?`
        )
    ) {
        return;
    }


    // Remove subjects assigned to this teacher
    subjects = subjects.filter(
        subject =>
            subject.teacherId !== teacher.id
    );


    // Remove timetable entries assigned to this teacher
    timetable = timetable.filter(
        item =>
            item.teacherId !== teacher.id
    );


    // Remove teacher
    teachers.splice(index, 1);


    await saveData();


    displayTeachers();

    displaySubjects();

    displayTimetable();

    populateTeacherDropdown();

    populateAssignmentTeacherDropdown();

    populateSubjectDropdown();

    updateDashboard();


    alert("Teacher deleted successfully.");

}


/* =========================================================
   11. TEACHER DROPDOWN
========================================================= */

function populateTeacherDropdown() {

    const select =
        document.getElementById(
            "subjectTeacher"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            Select Teacher
        </option>

    `;


    teachers.forEach(
        teacher => {

            const option =
                document.createElement("option");


            option.value =
                teacher.id;


            option.textContent =
                `${teacher.id} - ${teacher.name}`;


            select.appendChild(option);

        }
    );

}


function populateAssignmentTeacherDropdown() {

    const select =
        document.getElementById(
            "assignmentTeacher"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            Select Teacher
        </option>

    `;


    teachers.forEach(
        teacher => {

            const option =
                document.createElement("option");


            option.value =
                teacher.id;


            option.textContent =
                `${teacher.id} - ${teacher.name}`;


            select.appendChild(option);

        }
    );

}


/* =========================================================
   12. SUBJECT MANAGEMENT
========================================================= */

function setupSubjectForm() {

    const form =
        document.getElementById(
            "subjectForm"
        );


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            addSubject();

        }
    );

}


async function addSubject() {

    const name =
        document.getElementById(
            "subjectName"
        ).value.trim();

    const year =
        document.getElementById(
            "subjectYear"
        ).value;

    const semester =
        document.getElementById(
            "subjectSemester"
        ).value;

    const type =
        document.getElementById(
            "subjectType"
        ).value;

    const teacherId =
        document.getElementById(
            "subjectTeacher"
        ).value;

    const weeklyClasses =
        Number(
            document.getElementById(
                "weeklyClasses"
            ).value
        );


    if (
        !name ||
        !year ||
        !semester ||
        !type ||
        !teacherId
    ) {

        alert(
            "Please fill all required subject details."
        );

        return;

    }


    if (
        !Number.isInteger(weeklyClasses) ||
        weeklyClasses < 1
    ) {

        alert(
            "Classes per week must be at least 1."
        );

        return;

    }



    subjects.push({

        id:
            "SUB-" +
            Date.now(),
        name: name,

        year: year,

        semester: semester,

        type: type,

        teacherId: teacherId,

        weeklyClasses: weeklyClasses

    });


    await saveData();

    displaySubjects();

    populateSubjectDropdown();

    updateDashboard();


    document.getElementById(
        "subjectForm"
    ).reset();


    alert(
        "Subject added successfully."
    );

}


function displaySubjects() {

    const tbody =
        document.getElementById(
            "subjectTableBody"
        );


    tbody.innerHTML = "";


    if (subjects.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="8">

                    No subjects registered.

                </td>

            </tr>

        `;

        return;

    }


    subjects.forEach(
        (subject, index) => {

            const teacher =
                teachers.find(
                    teacher =>
                        teacher.id ===
                        subject.teacherId
                );


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHTML(subject.name)}
                </td>

                <td>
                    Year ${subject.year}
                </td>

                <td>
                    Semester ${subject.semester}
                </td>

                <td>
                    ${escapeHTML(subject.type)}
                </td>

                <td>
                    ${
                        teacher
                            ? escapeHTML(teacher.name)
                            : "Unknown"
                    }
                </td>

                <td>
                    ${subject.weeklyClasses}
                </td>

                <td>

                    <button
                        type="button"
                        class="delete-button"
                        

                        Delete

                    </button>

                </td>

            `;

                    const deleteButton = row.querySelector(".delete-button");

                    deleteButton.addEventListener("click", function () {
                    deleteSubject(index);
                    });
            tbody.appendChild(row);

        }
    );

}


async function deleteSubject(index) {

    const subject = subjects[index];

    if (!subject) {
        return;
    }

    if (!confirm(`Delete subject "${subject.name}"?`)) {
        return;
    }

    subjects.splice(index, 1);

    timetable = timetable.filter(
        item => item.subjectId !== subject.id
    );

    await saveData();

    displaySubjects();

    populateSubjectDropdown();

    updateDashboard();

    displayTimetable();
}

    alert("Subject deleted successfully.");




/* =========================================================
   13. SUBJECT DROPDOWN
========================================================= */

function populateSubjectDropdown() {

    const select =
        document.getElementById(
            "assignmentSubject"
        );

    const year =
    document.getElementById("assignmentYear").value;

    const semester =
    document.getElementById("assignmentSemester").value;



    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Select Subject
        </option>
    `;


    // Do not show subjects until year and semester are selected
    if (!year || !semester) {
        return;
    }


    const filteredSubjects =
        subjects.filter(
            subject =>
                subject.year === year &&
                subject.semester === semester
        );


    if (filteredSubjects.length === 0) {

        const option =
            document.createElement("option");

        option.value = "";

        option.textContent =
            "No subjects available for this semester";

        select.appendChild(option);

        return;
    }


    filteredSubjects.forEach(
        subject => {

            const option =
                document.createElement("option");

            option.value =
                subject.id;

            option.textContent =
                subject.name;

            select.appendChild(option);

        }
    );

}

/* =========================================================
   14. ROOM / LAB MANAGEMENT
========================================================= */

function setupRoomForm() {

    const form =
        document.getElementById(
            "roomForm"
        );


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            addRoom();

        }
    );

}


async function addRoom() {

    const number =
        document.getElementById("roomNumber")
            .value.trim();

    const type =
        document.getElementById("roomType")
            .value;

    const capacity =
        Number(
            document.getElementById("roomCapacity")
                .value
        );

    const subjectId =
        document.getElementById("roomSubject")
            .value;


    if (
        !number ||
        !type ||
        !capacity ||
        !subjectId
    ) {
        alert(
            "Please enter room number, type, capacity and subject."
        );

        return;
    }


    const duplicateRoom =
        rooms.some(
            room =>
                room.number.toLowerCase() ===
                number.toLowerCase()
        );


    if (duplicateRoom) {

        alert(
            "This room already exists."
        );

        return;
    }


    const duplicateSubject =
        rooms.some(
            room =>
                room.subjectId === subjectId
        );


    if (duplicateSubject) {

        const subject =
            subjects.find(
                s => s.id === subjectId
            );

        alert(
            `Subject "${subject ? subject.name : "selected subject"}" already has a fixed room.`
        );

        return;
    }


    rooms.push({

        id:
            "ROOM-" +
            Date.now(),

        number:
            number,

        type:
            type,

        capacity:
            capacity,

        subjectId:
            subjectId
    });


    await saveData();

    displayRooms();

    populateRoomDropdown();

    updateDashboard();


    document.getElementById(
        "roomForm"
    ).reset();


    alert(
        "Room added and fixed to the selected subject successfully."
    );
}


function displayRooms() {

    const tbody =
        document.getElementById(
            "roomTableBody"
        );


    tbody.innerHTML = "";


    if (rooms.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="5">

                    No classrooms or laboratories registered.

                </td>

            </tr>

        `;

        return;

    }


    rooms.forEach(
        (room, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHTML(room.number)}
                </td>

                <td>
                    ${escapeHTML(room.type)}
                </td>

                <td>
                    ${room.capacity}
                </td>

                <td>
                    ${
                        (() => {
                            const subject =
                                subjects.find(
                                    s =>
                                        s.id ===
                                        room.subjectId
                                );

                            return subject
                                ? escapeHTML(subject.name)
                                : "Not Assigned";
                        })()
                    }
                </td>

                <td>

                    <button
                        type="button"
                        class="delete-button"
                    

                        Delete

                    </button>

                </td>

            `;
                const deleteButton = row.querySelector(".delete-button");

                deleteButton.addEventListener("click", function () {
                deleteRoom(index);
                });

            tbody.appendChild(row);

        }
    );

}


async function deleteRoom(index) {

    const room = rooms[index];

    if (!room) {
        return;
    }

    const used = timetable.some(
        item => item.roomId === room.id
    );

    if (used) {

        alert(
            "This room is currently used in the timetable. Delete the timetable entry first."
        );

        return;
    }

    if (!confirm(`Delete "${room.number}"?`)) {
        return;
    }

    rooms.splice(index, 1);

    await saveData();

    displayRooms();

    populateRoomDropdown();

    updateDashboard();
}


    alert("Room deleted successfully.");




/* =========================================================
   15. ROOM DROPDOWN
========================================================= */
function populateRoomSubjectDropdown() {

    const select =
        document.getElementById(
            "roomSubject"
        );

    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Select Subject
        </option>
    `;


    subjects.forEach(
        subject => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                subject.id;

            option.textContent =
                subject.name;

            select.appendChild(
                option
            );
        }
    );
}

function populateRoomDropdown() {

    const select =
        document.getElementById(
            "assignmentRoom"
        );

    if (!select) {
        return;
    }


    const subjectId =
        document.getElementById(
            "assignmentSubject"
        ).value;


    select.innerHTML = `
        <option value="">
            Select Room
        </option>
    `;


    if (!subjectId) {
        return;
    }


    const fixedRoom =
        rooms.find(
            room =>
                room.subjectId ===
                subjectId
        );


    if (!fixedRoom) {

        const option =
            document.createElement(
                "option"
            );

        option.value = "";

        option.textContent =
            "No room fixed for this subject";

        select.appendChild(
            option
        );

        return;
    }


    const option =
        document.createElement(
            "option"
        );

    option.value =
        fixedRoom.id;

    option.textContent =
        `${fixedRoom.number} (${fixedRoom.type})`;

    select.appendChild(
        option
    );


    select.value =
        fixedRoom.id;
}


/* =========================================================
   16. MANUAL ASSIGNMENT
========================================================= */

function setupAssignmentForm() {

    const form =
        document.getElementById(
            "assignmentForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            addManualAssignment();

        }
    );

}


function addManualAssignment(){

    const year =
        document.getElementById("assignmentYear").value;

    const semester =
        document.getElementById("assignmentSemester").value;

    const day =
        document.getElementById("assignmentDay").value;

    const time =
        document.getElementById("assignmentTime").value;

    const subjectId =
        document.getElementById("assignmentSubject").value;

    const teacherId =
        document.getElementById("assignmentTeacher").value;

    const roomId =
        document.getElementById("assignmentRoom").value;


    if(
        !year ||
        !semester ||
        !day ||
        !time ||
        !subjectId ||
        !teacherId ||
        !roomId
    )
    {
        showConflictMessage(
            "Please fill all assignment details."
        );

        return;
    }


    const subject =
        subjects.find(
            x => x.id === subjectId
        );


    if(!subject){

        showConflictMessage(
            "Please select a valid subject."
        );

        return;
    }


    // Check whether the subject belongs
    // to the selected year and semester

    if(
        subject.year !== year ||
        subject.semester !== semester
    )
    {

        showConflictMessage(
            "❌ Please select a subject belonging to the selected year and semester."
        );

        return;
    }


    const duration =
        timeToMinutes(
            time.split("-")[1]
        ) -
        timeToMinutes(
            time.split("-")[0]
        );


    if(duration !== getSubjectDuration(subject)){

        showConflictMessage(
            subject.type === "Laboratory"
                ? "❌ A practical must occupy exactly 2 hours."
                : "❌ A lecture must occupy exactly 1 hour."
        );

        return;
    }


    const conflict =
        checkConflict(
            year,
            day,
            time,
            teacherId,
            roomId
        );


    if(conflict){

        showConflictMessage(conflict);

        return;
    }


    addAssignmentEntry(
        subject,
        year,
        semester,
        day,
        time,
        teacherId,
        roomId
    );


    saveData();

    displayTimetable();

    updateDashboard();

    document.getElementById(
        "assignmentForm"
    ).reset();


    populateAssignmentTimeDropdown(null);


    showConflictMessage(
        "Class assigned successfully.",
        true
    );

}

/* =========================================================
   17. CONFLICT DETECTION
========================================================= */

function checkConflict(year,day,time,teacherId,roomId){
    const existing=timetable.filter(item=>item.day===day&&timeRangeOverlaps(item.time,time));
    for(const item of existing){
        if(item.year===year)return "❌ Conflict: This year already has a class during this time.";
        if(item.teacherId===teacherId){const teacher=teachers.find(t=>t.id===teacherId);return `❌ Conflict: ${teacher?teacher.name:"This teacher"} is already teaching another class during this time.`;}
        if(item.roomId===roomId){const room=rooms.find(r=>r.id===roomId);return `❌ Conflict: ${room?room.number:"This room"} is already occupied during this time.`;}
    }
    return null;
}

function showConflictMessage(
    message,
    success = false
) {

    const element =
        document.getElementById(
            "conflictMessage"
        );


    element.innerText =
        message;


    if (success) {

        element.style.background =
            "#dcfce7";

        element.style.color =
            "#166534";

    }

    else {

        element.style.background =
            "#fee2e2";

        element.style.color =
            "#991b1b";

    }

}


/* =========================================================
   COLLEGE TIMING HELPERS
========================================================= */
const PRACTICAL_WINDOWS=[{start:"09:15",end:"11:15",label:"09:15 AM - 11:15 AM"},{start:"11:30",end:"13:30",label:"11:30 AM - 01:30 PM"},{start:"14:15",end:"16:15",label:"02:15 PM - 04:15 PM"}];
const LECTURE_WINDOWS=[{start:"09:15",end:"10:15",label:"09:15 AM - 10:15 AM"},{start:"10:15",end:"11:15",label:"10:15 AM - 11:15 AM"},{start:"11:30",end:"12:30",label:"11:30 AM - 12:30 PM"},{start:"12:30",end:"13:30",label:"12:30 PM - 01:30 PM"},{start:"14:15",end:"15:15",label:"02:15 PM - 03:15 PM"},{start:"15:15",end:"16:15",label:"03:15 PM - 04:15 PM"}];
function timeToMinutes(value){const [h,m]=value.split(":").map(Number);return h*60+m;}
function timeRangeOverlaps(a,b){const [as,ae]=a.split("-").map(timeToMinutes),[bs,be]=b.split("-").map(timeToMinutes);return as<be&&bs<ae;}
function getSubjectDuration(subject){return subject&&subject.type==="Laboratory"?120:60;}
function getAvailableWindows(subject){return subject&&subject.type==="Laboratory"?PRACTICAL_WINDOWS:LECTURE_WINDOWS;}
function populateAssignmentTimeDropdown(subject){const select=document.getElementById("assignmentTime");if(!select)return;select.innerHTML="";const p=document.createElement("option");p.value="";p.textContent=subject?(subject.type==="Laboratory"?"Select 2-hour practical time":"Select 1-hour lecture time"):"Select a subject first";select.appendChild(p);if(!subject)return;getAvailableWindows(subject).forEach(w=>{const o=document.createElement("option");o.value=`${w.start}-${w.end}`;o.textContent=w.label;select.appendChild(o);});}
function setupAssignmentTimeBySubject() {

    const select =
        document.getElementById(
            "assignmentSubject"
        );

    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        function () {

            const subject =
                subjects.find(
                    x =>
                        x.id ===
                        this.value
                );

            populateAssignmentTimeDropdown(
                subject
            );

            // Automatically select the fixed room
            populateRoomDropdown();
        }
    );


    populateAssignmentTimeDropdown(
        null
    );
}function addAssignmentEntry(subject,year,semester,day,time,teacherId,roomId){timetable.push({

    id:
        "TT-" +
        Date.now() +
        Math.random(),

    year: year,

    semester: semester,

    day: day,

    time: time,

    subjectId: subject.id,

    subjectCode: subject.code,

    teacherId: teacherId,

    roomId: roomId

});}

/* =========================================================
   18. AUTOMATIC TIMETABLE GENERATOR
========================================================= */

async function generateAutomaticTimetable() {

    if (teachers.length === 0) {

        alert(
            "Please add teachers first."
        );

        return;

    }


    if (subjects.length === 0) {

        alert(
            "Please add subjects first."
        );

        return;

    }


    if (rooms.length === 0) {

        alert(
            "Please add classrooms/laboratories first."
        );

        return;

    }


    timetable = [];


    const years = [
        "1",
        "2",
        "3",
        "4"
    ];


    let totalClasses = 0;


    for (
        const year of years
    ) {

        const yearSubjects =
            subjects.filter(
                subject =>
                    subject.year === year
            );


        if (
            yearSubjects.length === 0
        ) {

            continue;

        }


        for (
            const subject
            of yearSubjects
        ) {

            for (
                let count = 0;
                count < subject.weeklyClasses;
                count++
            ) {

                const placed =
                    placeSubjectAutomatically(
                        subject
                    );


                if (placed) {

                    totalClasses++;

                }

            }

        }

    }


    await saveData();

    displayTimetable();

    updateDashboard();


    alert(
        `Timetable generated successfully with ${totalClasses} classes.`
    );

}


/* =========================================================
   19. AUTOMATIC SUBJECT PLACEMENT
========================================================= */

function placeSubjectAutomatically(subject) {

    const fixedRoom =
        rooms.find(
            room =>
                room.subjectId ===
                subject.id
        );


    if (!fixedRoom) {

        console.warn(
            `No fixed room assigned for ${subject.name}`
        );

        return false;
    }


    const shuffledDays =
        [...days].sort(
            () =>
                Math.random() - 0.5
        );


    const shuffledWindows =
        [
            ...getAvailableWindows(subject)
        ].sort(
            () =>
                Math.random() - 0.5
        );


    for (
        const day of shuffledDays
    ) {

        for (
            const window
            of shuffledWindows
        ) {

            const time =
                `${window.start}-${window.end}`;


            if (
                !checkConflict(
                    subject.year,
                    day,
                    time,
                    subject.teacherId,
                    fixedRoom.id
                )
            ) {

                addAssignmentEntry(
                    subject,
                    subject.year,
                    subject.semester,
                    day,
                    time,
                    subject.teacherId,
                    fixedRoom.id
                );

                return true;
            }
        }
    }


    return false;
}

/* =========================================================
   20. DISPLAY TIMETABLE
========================================================= */

function displayTimetable() {

    displayYearTimetable(
        "1",
        "firstYearTableBody"
    );


    displayYearTimetable(
        "2",
        "secondYearTableBody"
    );


    displayYearTimetable(
        "3",
        "thirdYearTableBody"
    );


    displayYearTimetable(
        "4",
        "fourthYearTableBody"
    );

}


function displayYearTimetable(year,tableBodyId){
    const tbody=document.getElementById(tableBodyId);if(!tbody)return;tbody.innerHTML="";const entries=timetable.filter(x=>x.year===year);
    timeSlots.forEach(slot=>{const row=document.createElement("tr"),tc=document.createElement("td");tc.innerText=slot.label;row.appendChild(tc);days.forEach(day=>{const cell=document.createElement("td");
        if(slot.type==="meditation"){cell.innerText="🧘 Meditation";cell.className="meditation-cell";row.appendChild(cell);return;}
        if(slot.type==="shortBreak"){cell.innerText="☕ Short Break";cell.className="short-break";row.appendChild(cell);return;}
        if(slot.type==="lunch"){cell.innerText="🍴 Long Break";cell.className="lunch-break";row.appendChild(cell);return;}
        const slotTime=`${slot.start}-${slot.end}`,item=entries.find(x=>x.day===day&&timeRangeOverlaps(x.time,slotTime));
        if(item){const [st,en]=item.time.split("-").map(timeToMinutes),duration=en-st;if(duration===120&&timeToMinutes(slot.start)===st){cell.rowSpan=2;cell.className="practical-cell";cell.innerHTML=createSubjectCell(item);}else if(duration===120){return;}else{cell.innerHTML=createSubjectCell(item);}}else{cell.innerHTML=`<span class="free-period">Free</span>`;}
        row.appendChild(cell);});tbody.appendChild(row);});
}

function createSubjectCell(
    item
) {

    const subject =
        subjects.find(
            subject =>
                subject.id ===
                item.subjectId
        );


    const teacher =
        teachers.find(
            teacher =>
                teacher.id ===
                item.teacherId
        );


    const room =
        rooms.find(
            room =>
                room.id ===
                item.roomId
        );


    if (!subject) {

        return "Unknown Subject";

    }


    return `

        <div class="subject-cell">
            
            <strong>
                ${escapeHTML(subject.name)}
            </strong>

            <br>

            👨‍🏫
            ${
                teacher
                    ? escapeHTML(teacher.name)
                    : "Unknown"
            }

            <br>

            🏫
            ${
                room
                    ? escapeHTML(room.number)
                    : "Unknown"
            }

        </div>

    `;

}


/* =========================================================
   21. DOWNLOAD TIMETABLE
========================================================= */

function downloadTimetable() {

    if (
        timetable.length === 0
    ) {

        alert(
            "Please generate a timetable first."
        );

        return;

    }


    let csv =
        "Year,Day,Time,Subject,Teacher,Room\n";


    timetable.forEach(
        item => {

            const subject =
                subjects.find(
                    s =>
                        s.id ===
                        item.subjectId
                );


            const teacher =
                teachers.find(
                    t =>
                        t.id ===
                        item.teacherId
                );


            const room =
                rooms.find(
                    r =>
                        r.id ===
                        item.roomId
                );


            csv += [

                `Year ${item.year}`,

                item.day,

                item.time,

                subject
                    ? subject.name
                    : "",

                teacher
                    ? teacher.name
                    : "",

                room
                    ? room.number
                    : ""

            ]
            .map(
                value =>
                    `"${String(value)
                        .replace(/"/g, '""')}"`
            )
            .join(",");


            csv += "\n";

        }
    );


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "University-Timetable.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);

}


/* =========================================================
   22. PRINT / SAVE PDF
========================================================= */

function printTimetable() {

    window.print();

}


/* =========================================================
   23. DASHBOARD COUNTS
========================================================= */

function updateDashboard() {

    const teacherCount =
        document.getElementById(
            "teacherCount"
        );


    const subjectCount =
        document.getElementById(
            "subjectCount"
        );


    const classroomCount =
        document.getElementById(
            "classroomCount"
        );


    const laboratoryCount =
        document.getElementById(
            "laboratoryCount"
        );


    const timetableCount =
        document.getElementById(
            "timetableCount"
        );


    if (teacherCount) {

        teacherCount.innerText =
            teachers.length;

    }


    if (subjectCount) {

        subjectCount.innerText =
            subjects.length;

    }


    if (classroomCount) {

        classroomCount.innerText =
            rooms.filter(
                room =>
                    room.type ===
                    "Classroom"
            ).length;

    }


    if (laboratoryCount) {

        laboratoryCount.innerText =
            rooms.filter(
                room =>
                    room.type ===
                    "Laboratory"
            ).length;

    }


    if (timetableCount) {

        timetableCount.innerText =
            timetable.length;

    }

}


/* =========================================================
   24. SECURITY HELPER
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

async function resetSystem() {
    const confirmReset = confirm(
        "Are you sure you want to reset the entire system?\n\n" +
        "This will delete all teachers, subjects, rooms and timetable data."
    );

    if (!confirmReset) {
        return;
    }

    try {
        // Clear all application data
        teachers = [];
        subjects = [];
        rooms = [];
        timetable = [];

        // Save the empty data to Firebase
        await saveData();

        // Update the screen
        displayTeachers();
        displaySubjects();
        displayRooms();
        displayTimetable();
        updateDashboard();

        // Update dropdowns
        populateTeacherDropdowns();
        populateSubjectDropdowns();
        populateRoomDropdowns();

        alert("System has been reset successfully!");

    } catch (error) {
        console.error("Reset error:", error);
        alert("Unable to reset the system. Please try again.");
    }
}

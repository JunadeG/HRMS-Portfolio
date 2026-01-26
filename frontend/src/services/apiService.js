export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'; // Your backend URL

// Function to get the token from localStorage
const getAuthToken = () => localStorage.getItem('jwtToken');

// Centralized handler for API responses
const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    let responseData;
    const url = response.url;

    try {
        if (response.status === 204) {
             return { ok: response.ok, status: response.status, data: null };
        }
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
             responseData = await response.text();
        }
    } catch (parseError) {
        if (!response.ok) {
             throw new Error(`HTTP error! Status: ${response.status}. Failed to parse response body.`);
        }
        return { ok: response.ok, status: response.status, data: typeof responseData === 'string' && responseData.trim() !== '' ? responseData : null };
    }

    if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || (typeof responseData === 'string' && responseData.trim() !== '' ? responseData : `HTTP Error ${response.status}`);
        console.error(`handleResponse: API Error for ${url}. Status: ${response.status}. Error: ${errorMessage}. Response Data:`, responseData);

        // ONLY clear the token on a 401 Unauthorized error.
        // A 403 Forbidden error means the token is valid, but permissions are lacking.
        if (response.status === 401) {
             localStorage.removeItem('jwtToken');
             throw new Error(`Authentication failed (401). Please log in again.`);
        }
        
        if (responseData?.details) {
            const errorObj = new Error(errorMessage);
            errorObj.details = responseData.details;
            throw errorObj;
        }
        throw new Error(errorMessage);
    }
    
    if (responseData?.details) {
        return { ok: response.ok, status: response.status, data: responseData, details: responseData.details };
    }
    return { ok: response.ok, status: response.status, data: responseData };
};


// Function to make authenticated requests (handles JWT)
const authenticatedRequest = async (url, options = {}) => {
    const token = getAuthToken();
    const isAuthEndpoint = url.includes('/auth/');

    // Prevent fetching if token is missing on protected routes, unless it's an auth endpoint itself.
    // The handleResponse now also clears the token on 401/403 errors.
    // This check is slightly redundant but can catch issues earlier for explicit token requirement.
    if (!token && !isAuthEndpoint && !(url.includes('/api/departments') || url.includes('/static/profile-pics/'))) { // Add public API paths to exclusion
         console.error(`apiService: Blocking request to ${url} - No token found.`);
         // This throw will be caught by components, ideally leading to logout.
         throw new Error("No authentication token found. Please log in.");
    }

    const headers = { ...options.headers };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Set Content-Type unless body is FormData
    if (!(options.body instanceof FormData)) {
         if (!headers['Content-Type']) { // Avoid overwriting if consumer set it
             headers['Content-Type'] = 'application/json';
         }
        // Stringify body only if Content-Type is JSON and it's an object
         if (headers['Content-Type'] === 'application/json' && typeof options.body === 'object' && options.body !== null) {
             options.body = JSON.stringify(options.body);
         }
    } else {
         // Content-Type header must NOT be set when sending FormData, browsers set it correctly.
         delete headers['Content-Type'];
    }


    try {
        const response = await fetch(url, { ...options, headers });
        const result = await handleResponse(response);
        // handleResponse throws on !response.ok, so if we reach here, response.ok is true.
        return result.data; // Return just the data part on success
    } catch (error) {
        console.error(`apiService: Request ${options.method || 'GET'} ${url} failed. Error:`, error.message, error.details ? '(with details)' : '');
         // Re-throw the enhanced error object (if available)
        throw error;
    }
};


// --- Public API Functions --- (unchanged, still use standard fetch but with handleResponse)
export const loginUser = async (username, password, companyId, loginAs) => {
    const url = `${API_BASE_URL}/auth/login`;
    console.log(`apiService: POST ${url}`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, companyId: parseInt(companyId, 10), loginAs })
        });
         // Pass the raw response back so HomePage can check response.ok and status
        return response; // Let the calling component check `response.ok`
    } catch (error) {
         console.error(`apiService: Network error in loginUser: ${error.message}`);
        throw error;
    }
};

export const registerUser = async (registrationData) => {
    const url = `${API_BASE_URL}/auth/register`;
    console.log(`apiService: POST ${url}`);
    try {
       const response = await fetch(url, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(registrationData)
       });
        // Pass the raw response back so RegistrationPopup can check response.ok
       return response;
    } catch (error) {
         console.error(`apiService: Network error in registerUser: ${error.message}`);
         throw error;
    }
};

export const fetchCompanies = async () => {
    const url = `${API_BASE_URL}/auth/companies`; // Still public
    console.log(`apiService: GET ${url}`);
    try {
        const response = await fetch(url); // Public endpoint, no token needed
        const result = await handleResponse(response); // Use handleResponse for parsing/error
        return Array.isArray(result.data) ? result.data : []; // Ensure array is returned
    } catch (error) {
        console.error(`apiService: Error in fetchCompanies: ${error.message}`);
        throw error;
    }
};

export const fetchDepartments = async () => {
    const url = `${API_BASE_URL}/api/departments`; // Public endpoint
    console.log(`apiService: GET ${url}`);
    try {
       const response = await fetch(url); // Public endpoint, no token needed
       const result = await handleResponse(response); // Use handleResponse
       return Array.isArray(result.data) ? result.data : []; // Ensure array
    } catch (error) {
        console.error(`apiService: Error fetching departments: ${error.message}`);
        throw error;
    }
};

export const forgotPasswordRequest = async (username, companyId) => {
    const url = `${API_BASE_URL}/auth/forgot-password`; // Still public
    console.log(`apiService: POST ${url}`);
    const body = { username, companyId: parseInt(companyId, 10) };
    try {
        const response = await fetch(url, { // Public endpoint, no token needed
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await handleResponse(response); // Use handleResponse
        return result.data;
    } catch (error) {
        console.error(`apiService: Error in forgotPasswordRequest: ${error.message}`);
        throw error;
    }
};

export const resetPasswordSubmit = async (username, newPassword, token) => {
    const url = `${API_BASE_URL}/auth/reset-password`; // Still public
    console.log(`apiService: POST ${url}`);
    const body = { username, newPassword, token };
    try {
        const response = await fetch(url, { // Public endpoint, no token needed
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await handleResponse(response); // Use handleResponse
        return result.data;
    } catch (error) {
        console.error(`apiService: Error in resetPasswordSubmit: ${error.message}`);
        throw error;
    }
};


// --- Authenticated API Functions --- (Using the new authenticatedRequest helper)
export const fetchDashboardData = async () => {
    const url = `${API_BASE_URL}/api/dashboard/data`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchUserProfile = async () => {
    const url = `${API_BASE_URL}/api/users/profile`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

export const updateUserProfile = async (profileData) => {
    const url = `${API_BASE_URL}/api/users/profile`;
    console.log(`apiService: PUT ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'PUT', body: profileData });
};

export const uploadProfilePicture = async (formData) => {
    const url = `${API_BASE_URL}/api/users/profile/picture`;
    console.log(`apiService: POST ${url} (uploading picture, authenticated)`);
    // Note: authenticatedRequest automatically handles the Content-Type for FormData
    return authenticatedRequest(url, { method: 'POST', body: formData });
};


// --- Attendance Functions (authenticated) ---
export const clockIn = async () => {
    const url = `${API_BASE_URL}/api/attendance/clock-in`;
    console.log(`apiService: POST ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'POST' });
};
export const clockOut = async () => {
    const url = `${API_BASE_URL}/api/attendance/clock-out`;
    console.log(`apiService: POST ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'POST' });
};
export const getAttendanceStatus = async () => {
    const url = `${API_BASE_URL}/api/attendance/status`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};
export const fetchAttendanceHistory = async (startDate, endDate) => {
    let url = `${API_BASE_URL}/api/attendance/history`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    if (queryString) { url += `?${queryString}`; }
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};


// --- Admin Functions (authenticated) ---
export const fetchPendingApprovals = async () => {
    const url = `${API_BASE_URL}/admin/pending-approvals`;
    console.log(`apiService: GET ${url} (admin authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};
export const approveUser = async (userId) => {
    const url = `${API_BASE_URL}/admin/approve/${userId}`;
    console.log(`apiService: POST ${url} (admin authenticated)`);
    return authenticatedRequest(url, { method: 'POST' });
};
export const rejectUser = async (userId) => {
    const url = `${API_BASE_URL}/admin/reject/${userId}`;
    console.log(`apiService: DELETE ${url} (admin authenticated)`);
     // DELETE requests typically don't have a body, ensure this endpoint doesn't expect one.
    return authenticatedRequest(url, { method: 'DELETE'});
};
export const fetchAdminUsers = async () => {
    const url = `${API_BASE_URL}/admin/users`; // Fetch all users in admin's company
    console.log(`apiService: GET ${url} (admin authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};
// Function to fetch a single user by ID (might be needed for full detail editing later)
// export const fetchUserByIdForAdmin = async (userId) => { ... }; // Endpoint TBD in backend

export const addUserByAdmin = async (userData) => {
    const url = `${API_BASE_URL}/admin/users`;
    console.log(`apiService: POST ${url} (admin authenticated)`);
    return authenticatedRequest(url, { method: 'POST', body: userData });
};
export const deleteUserByAdmin = async (userId) => {
    const url = `${API_BASE_URL}/admin/users/${userId}`;
    console.log(`apiService: DELETE ${url} (admin authenticated)`);
    return authenticatedRequest(url, { method: 'DELETE'});
};
export const updateUserDepartmentByAdmin = async (userId, departmentName) => {
    const url = `${API_BASE_URL}/admin/users/${userId}/department`;
    console.log(`apiService: PUT ${url} (admin authenticated)`);
    return authenticatedRequest(url, { method: 'PUT', body: { department: departmentName } });
};


// --- Notice Management (authenticated) ---
export const createNotice = async (noticeData) => {
    const url = `${API_BASE_URL}/api/notices`;
    console.log(`apiService: POST ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'POST', body: noticeData });
};

// --- Meeting Management (authenticated) ---
export const createMeeting = async (meetingData) => {
    const url = `${API_BASE_URL}/api/meetings`;
    console.log(`apiService: POST ${url} (authenticated)`);
    // Backend MeetingService now handles ISO string parsing
    // Pass the ISO string directly from DTO (or convert just before calling API)
    // Assuming frontend handles datetime-local to ISO string conversion if needed
     // API expects ISO string now based on backend code changes, convert Date objects if you were using them before
     const dataToSend = {
         ...meetingData,
        //  If your frontend datetime pickers give you JS Date objects, convert them here:
         // startTime: meetingData.startTime instanceof Date ? meetingData.startTime.toISOString() : meetingData.startTime,
         // endTime: meetingData.endTime instanceof Date ? meetingData.endTime.toISOString() : meetingData.endTime,
         // If they give strings in a different format, you need conversion here before sending ISO string.
         // If the DTO already expects and gets ISO strings from frontend (like the current CreateMeetingForm.jsx),
         // then pass it directly:
         startTime: meetingData.startTime,
         endTime: meetingData.endTime
     };
    return authenticatedRequest(url, { method: 'POST', body: dataToSend });
};


export const fetchUserByIdForAdmin = async (userId) => {
    const url = `${API_BASE_URL}/admin/users/${userId}`;
    console.log(`apiService: GET ${url} (admin authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

// --- Leave Management Functions (User - authenticated) ---
export const requestLeave = async (leaveData) => {
    const url = `${API_BASE_URL}/api/leave`;
    console.log(`apiService: POST ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'POST', body: leaveData });
};
export const getMyLeaveRequests = async () => {
    const url = `${API_BASE_URL}/api/leave/my-requests`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};
export const cancelLeaveRequest = async (requestId) => {
    const url = `${API_BASE_URL}/api/leave/${requestId}/cancel`;
    console.log(`apiService: POST ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'POST' });
};
export const getMyLeaveBalances = async () => {
    const url = `${API_BASE_URL}/api/leave/balances`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

// --- Leave Management Functions (Admin - authenticated) ---
export const getPendingLeaveRequests = async () => {
    const url = `${API_BASE_URL}/api/leave/admin/pending`;
    console.log(`apiService: GET ${url} (admin authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};
export const approveLeaveRequest = async (requestId) => {
    const url = `${API_BASE_URL}/api/leave/admin/${requestId}/approve`;
    console.log(`apiService: POST ${url} (admin authenticated)`);
    return authenticatedRequest(url, { method: 'POST' });
};
export const rejectLeaveRequest = async (requestId) => {
    const url = `${API_BASE_URL}/api/leave/admin/${requestId}/reject`;
    console.log(`apiService: POST ${url} (admin authenticated)`);
     // DELETE requests often don't have bodies, using POST for state change here.
    return authenticatedRequest(url, { method: 'POST'}); // Match backend POST
};

// --- NEW PAYROLL API FUNCTIONS ---
export const fetchDepartmentStructures = async () => {
    const url = `${API_BASE_URL}/api/payroll/structures`;
    console.log(`apiService: GET ${url} (admin authenticated - Structures)`);
    return authenticatedRequest(url, { method: 'GET' });
};

export const saveDepartmentStructure = async (structureData) => {
    const url = `${API_BASE_URL}/api/payroll/structures`;
    console.log(`apiService: POST ${url} (admin authenticated - Structures)`);
    return authenticatedRequest(url, { method: 'POST', body: structureData });
};

export const deleteDepartmentStructure = async (structureId) => {
    const url = `${API_BASE_URL}/api/payroll/structures/${structureId}`;
    console.log(`apiService: DELETE ${url} (admin authenticated - Structures)`);
    return authenticatedRequest(url, { method: 'DELETE'});
};

export const updateUserPayrollDetails = async (userId, payrollData) => {
    const url = `${API_BASE_URL}/api/payroll/users/${userId}/payroll-details`;
    console.log(`apiService: PUT ${url} (admin authenticated - User Payroll)`);
    return authenticatedRequest(url, { method: 'PUT', body: payrollData });
};

export const calculatePayrollPreview = async () => {
    const url = `${API_BASE_URL}/api/payroll/calculate-preview`;
    console.log(`apiService: GET ${url} (admin authenticated - Payroll Preview)`);
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchSalaryComponentsForAdmin = async () => {
    const url = `${API_BASE_URL}/api/payroll/components`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const createSalaryComponent = async (componentData) => {
    const url = `${API_BASE_URL}/api/payroll/components`;
    return authenticatedRequest(url, { method: 'POST', body: componentData });
};

export const deleteSalaryComponent = async (componentId) => {
    const url = `${API_BASE_URL}/api/payroll/components/${componentId}`;
    return authenticatedRequest(url, { method: 'DELETE' });
};

// --- Employee Salary Component Assignment APIs ---
export const fetchEmployeeComponents = async (userId) => {
    const url = `${API_BASE_URL}/api/payroll/users/${userId}/components`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const assignComponentToEmployee = async (userId, componentId, value) => {
    const url = `${API_BASE_URL}/api/payroll/users/${userId}/components`;
    const body = { componentId, value: parseFloat(value) };
    return authenticatedRequest(url, { method: 'POST', body });
};

export const removeComponentFromEmployee = async (employeeComponentId) => {
    const url = `${API_BASE_URL}/api/payroll/users/components/${employeeComponentId}`;
    return authenticatedRequest(url, { method: 'DELETE' });
};
export const generatePayslipsForMonth = async (payPeriodDate) => {
    const url = `${API_BASE_URL}/api/payroll/generate`;
    const body = { payPeriod: payPeriodDate };
    return authenticatedRequest(url, { method: 'POST', body });
};

export const fetchMyPayslips = async (year, month) => {
    const url = `${API_BASE_URL}/api/payroll/my-payslips?year=${year}&month=${month}`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchPayslipDetails = async (payslipId) => {
    const url = `${API_BASE_URL}/api/payroll/${payslipId}`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const respondToMeeting = async (meetingId, response) => {
    const url = `${API_BASE_URL}/api/meetings/${meetingId}/respond`;
    // response should be a string: "ACCEPTED" or "DECLINED"
    const body = { response };
    return authenticatedRequest(url, { method: 'POST', body });
};
export const updateUserAsAdmin = async (userId, updateData) => {
    const url = `${API_BASE_URL}/admin/users/${userId}/details`;
    console.log(`apiService: PUT ${url} (admin authenticated)`);
    return authenticatedRequest(url, { method: 'PUT', body: updateData });
};

export const fetchMyTeam = async () => {
    const url = `${API_BASE_URL}/api/users/my-team`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

// export const fetchActiveProjects = async () => {
//     const url = `${API_BASE_URL}/api/projects`;
//     return authenticatedRequest(url, { method: 'GET' });
// };

// export const fetchCurrentTimesheet = async () => {
//     const url = `${API_BASE_URL}/api/timesheets/current`;
//     return authenticatedRequest(url, { method: 'GET' });
// };

// export const saveTimesheet = async (timesheetId, entries) => {
//     const url = `${API_BASE_URL}/api/timesheets/${timesheetId}`;
//     // The entries array is the body of the request
//     return authenticatedRequest(url, { method: 'POST', body: entries });
// };

// export const submitTimesheet = async (timesheetId) => {
//     const url = `${API_BASE_URL}/api/timesheets/${timesheetId}/submit`;
//     // This endpoint doesn't require a body
//     return authenticatedRequest(url, { method: 'POST' });
// };

// export const fetchPendingTimesheets = async () => {
//     const url = `${API_BASE_URL}/api/timesheets/approvals`;
//     return authenticatedRequest(url, { method: 'GET' });
// };

// export const approveTimesheet = async (timesheetId) => {
//     const url = `${API_BASE_URL}/api/timesheets/${timesheetId}/approve`;
//     return authenticatedRequest(url, { method: 'POST' });
// };

// export const rejectTimesheet = async (timesheetId) => {
//     const url = `${API_BASE_URL}/api/timesheets/${timesheetId}/reject`;
//     return authenticatedRequest(url, { method: 'POST' });
// };

export const fetchPublicUserProfile = async (userId) => {
    const url = `${API_BASE_URL}/api/users/view/${userId}`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

// export const fetchFeed = async () => {
//     const url = `${API_BASE_URL}/api/feed`;
//     return authenticatedRequest(url, { method: 'GET' });
// };

// export const createPost = async (content) => {
//     const url = `${API_BASE_URL}/api/feed`;
//     const body = { content };
//     return authenticatedRequest(url, { method: 'POST', body });
// };
export const fetchCompanyAttendanceForDate = async (date) => {
    // date should be a string in 'YYYY-MM-DD' format
    const url = `${API_BASE_URL}/api/attendance/admin/daily?date=${date}`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchEmployeeAttendanceHistory = async (employeeId) => {
    const url = `${API_BASE_URL}/api/attendance/admin/history/${employeeId}`;
    return authenticatedRequest(url, { method: 'GET' });
};

// export const createComment = async (postId, content) => {
//     const url = `${API_BASE_URL}/api/feed/${postId}/comments`;
//     const body = { content };
//     return authenticatedRequest(url, { method: 'POST', body });
// };

// export const deletePost = async (postId) => {
//     const url = `${API_BASE_URL}/api/feed/${postId}`;
//     return authenticatedRequest(url, { method: 'DELETE' });
// };
export const createTicket = async (subject, description, category) => {
    const url = `${API_BASE_URL}/api/tickets`;
    const body = { subject, description, category };
    return authenticatedRequest(url, { method: 'POST', body });
};

export const fetchMyTickets = async () => {
    const url = `${API_BASE_URL}/api/tickets/my-tickets`;
    return authenticatedRequest(url, { method: 'GET' });
};

// Admin-specific function we will use later
export const fetchAllCompanyTickets = async () => {
    const url = `${API_BASE_URL}/api/tickets/admin/all`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchTicketDetailsForAdmin = async (ticketId) => {
    const url = `${API_BASE_URL}/api/tickets/${ticketId}`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const addCommentToTicket = async (ticketId, content) => {
    const url = `${API_BASE_URL}/api/tickets/${ticketId}/comments`;
    const body = { content };
    return authenticatedRequest(url, { method: 'POST', body });
};

export const updateTicketStatus = async (ticketId, status) => {
    const url = `${API_BASE_URL}/api/tickets/${ticketId}/status`;
    const body = { status };
    return authenticatedRequest(url, { method: 'PUT', body });
};

export const assignTicket = async (ticketId, assigneeId) => {
    const url = `${API_BASE_URL}/api/tickets/${ticketId}/assign`;
    const body = { assigneeId };
    return authenticatedRequest(url, { method: 'PUT', body });
};

export const fetchAssignableUsers = async () => {
    const url = `${API_BASE_URL}/api/tickets/admin/assignable-users`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const searchEmployees = async (query) => {
    const url = `${API_BASE_URL}/api/search/employees?q=${encodeURIComponent(query)}`;
    return authenticatedRequest(url, { method: 'GET' });
};

// export const fetchTimesheetHistory = async (year, month) => {
//     const url = `${API_BASE_URL}/api/timesheets/history?year=${year}&month=${month}`;
//     console.log(`apiService: GET ${url} (authenticated)`);
//     return authenticatedRequest(url, { method: 'GET' });
// };

// export const fetchRejectedTimesheets = async () => {
//     const url = `${API_BASE_URL}/api/timesheets/rejected`;
//     console.log(`apiService: GET ${url} (authenticated)`);
//     return authenticatedRequest(url, { method: 'GET' });
// };



export const fetchActiveProjects = async () => {
    // Note: The controller path for this was also moved for consistency.
    const url = `${API_BASE_URL}/api/timesheets/projects`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchCurrentTimesheet = async () => {
    // CORRECT URL: /api/timesheets/current
    const url = `${API_BASE_URL}/api/timesheets/current`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const saveTimesheet = async (timesheetId, entries) => {
    // CORRECT URL: /api/timesheets/{id}
    const url = `${API_BASE_URL}/api/timesheets/${timesheetId}`;
    return authenticatedRequest(url, { method: 'POST', body: entries });
};

export const submitTimesheet = async (timesheetId) => {
    // CORRECT URL: /api/timesheets/{id}/submit
    const url = `${API_BASE_URL}/api/timesheets/${timesheetId}/submit`;
    return authenticatedRequest(url, { method: 'POST' });
};

export const fetchPendingTimesheets = async () => {
    // CORRECT URL: /api/timesheets/approvals
    const url = `${API_BASE_URL}/api/timesheets/approvals`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const approveTimesheet = async (timesheetId) => {
    // CORRECT URL: /api/timesheets/{id}/approve
    const url = `${API_BASE_URL}/api/timesheets/${timesheetId}/approve`;
    return authenticatedRequest(url, { method: 'POST' });
};

export const rejectTimesheet = async (timesheetId) => {
    // CORRECT URL: /api/timesheets/{id}/reject
    const url = `${API_BASE_URL}/api/timesheets/${timesheetId}/reject`;
    return authenticatedRequest(url, { method: 'POST' });
};

export const fetchTimesheetHistory = async (year, month) => {
    // CORRECT URL: /api/timesheets/history
    const url = `${API_BASE_URL}/api/timesheets/history?year=${year}&month=${month}`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchRejectedTimesheets = async () => {
    // CORRECT URL: /api/timesheets/rejected
    const url = `${API_BASE_URL}/api/timesheets/rejected`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchPastDueTimesheets = async () => {
    const url = `${API_BASE_URL}/api/timesheets/past-due`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

export const recallTimesheet = async (timesheetId) => {
    const url = `${API_BASE_URL}/api/timesheets/${timesheetId}/recall`;
    console.log(`apiService: POST ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'POST' });
};

export const fetchProjectTimeSummary = async (year, month) => {
    const url = `${API_BASE_URL}/api/timesheets/summary/by-project?year=${year}&month=${month}`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchBillingTimeSummary = async (year, month) => {
    const url = `${API_BASE_URL}/api/timesheets/summary/by-billing-type?year=${year}&month=${month}`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchMyTasks = async () => {
    const url = `${API_BASE_URL}/api/project-management/my-tasks`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchMyProjectAllocations = async () => {
    const url = `${API_BASE_URL}/api/project-management/my-allocations`;
    console.log(`apiService: GET ${url} (authenticated)`);
    return authenticatedRequest(url, { method: 'GET' });
};

export const createTask = async (taskData) => {
    const url = `${API_BASE_URL}/api/project-management/tasks`;
    return authenticatedRequest(url, { method: 'POST', body: taskData });
};

export const createAllocation = async (allocationData) => {
    const url = `${API_BASE_URL}/api/project-management/allocations`;
    return authenticatedRequest(url, { method: 'POST', body: allocationData });
};

export const updateTaskStatus = async (taskId, status) => {
    const url = `${API_BASE_URL}/api/project-management/tasks/${taskId}/status`;
    const body = { status };
    return authenticatedRequest(url, { method: 'PUT', body });
};

export const fetchAttendanceSummary = async (year, month) => {
    const url = `${API_BASE_URL}/api/attendance/summary?year=${year}&month=${month}`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const requestAttendanceCorrection = async (correctionData) => {
    const url = `${API_BASE_URL}/api/attendance/request-correction`;
    return authenticatedRequest(url, { method: 'POST', body: correctionData });
};

export const fetchPendingAttendanceCorrections = async () => {
    const url = `${API_BASE_URL}/api/attendance/admin/corrections/pending`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const approveAttendanceCorrection = async (correctionId) => {
    const url = `${API_BASE_URL}/api/attendance/admin/corrections/${correctionId}/approve`;
    return authenticatedRequest(url, { method: 'POST' });
};

export const rejectAttendanceCorrection = async (correctionId) => {
    const url = `${API_BASE_URL}/api/attendance/admin/corrections/${correctionId}/reject`;
    return authenticatedRequest(url, { method: 'POST' });
};

export const fetchCompanyAssets = async () => {
    const url = `${API_BASE_URL}/api/assets/admin/company-assets`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const createAsset = async (assetData) => {
    const url = `${API_BASE_URL}/api/assets/admin/create`;
    return authenticatedRequest(url, { method: 'POST', body: assetData });
};

export const allocateAsset = async (assetId, userId) => {
    const url = `${API_BASE_URL}/api/assets/admin/allocate`;
    const body = { assetId, userId };
    return authenticatedRequest(url, { method: 'POST', body });
};

export const deallocateAsset = async (assetId) => {
    const url = `${API_BASE_URL}/api/assets/admin/${assetId}/deallocate`;
    return authenticatedRequest(url, { method: 'POST' });
};

export const fetchMyAssets = async () => {
    const url = `${API_BASE_URL}/api/assets/my-assets`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const fetchMyDocuments = async () => {
    const url = `${API_BASE_URL}/api/documents/my-documents`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const uploadDocument = async (formData) => {
    const url = `${API_BASE_URL}/api/documents/upload`;
    // Note: authenticatedRequest handles FormData content type automatically
    return authenticatedRequest(url, { method: 'POST', body: formData });
};

export const fetchPendingVerificationDocs = async () => {
    const url = `${API_BASE_URL}/api/documents/admin/pending`;
    return authenticatedRequest(url, { method: 'GET' });
};

export const verifyDocument = async (documentId, isApproved, notes) => {
    const url = `${API_BASE_URL}/api/documents/admin/${documentId}/verify`;
    const body = { isApproved, notes };
    return authenticatedRequest(url, { method: 'POST', body });
};

export const completeOnboarding = async (userId) => {
    const url = `${API_BASE_URL}/admin/users/${userId}/complete-onboarding`;
    console.log(`apiService: POST ${url} (admin authenticated)`);
    return authenticatedRequest(url, { method: 'POST' });
};
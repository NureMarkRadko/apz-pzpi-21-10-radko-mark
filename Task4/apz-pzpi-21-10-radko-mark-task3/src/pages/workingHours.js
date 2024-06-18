import React, { useState, useEffect } from 'react';
import { getLocalizedString } from '../locale/lang';
import { NotificationManager, NotificationContainer } from 'react-notifications';
import '../styles/EmployeePage.css';

const EmployeePage = () => {
    let preferredLang = localStorage.getItem('language');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [employeeWorkHours, setEmployeeWorkHours] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const selectedDepartmentId = localStorage.getItem('DepartmentId');

            const response = await fetch(`http://localhost:5000/api/employee/department`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ DepartmentId: selectedDepartmentId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch employees');
            }

            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setErrorMessage(error.message || getLocalizedString(preferredLang, 'Failed to fetch employees'));
            NotificationManager.error(error.message || getLocalizedString(preferredLang, 'Failed to fetch employees'));
        }
    };

    const fetchEmployeeWorkHours = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/employee/workhours`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify({ EmployeeId: selectedEmployeeId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch employee work hours');
            }

            const data = await response.json();
            setEmployeeWorkHours(data);
        } catch (error) {
            console.error('Error fetching employee work hours:', error);
            setErrorMessage(error.message || getLocalizedString(preferredLang, 'Failed to fetch employee work hours'));
            NotificationManager.error(error.message || getLocalizedString(preferredLang, 'Failed to fetch employee work hours'));
        }
    };

    const handleEmployeeClick = async (employeeId) => {
        setSelectedEmployeeId(employeeId);
        await fetchEmployeeWorkHours();
    };

    const calculateTimeDifference = (startTime, endTime) => {
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        const difference = end.getTime() - start.getTime();

        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours} ${getLocalizedString(preferredLang, 'hours')} ${minutes} ${getLocalizedString(preferredLang, 'minutes')}`;
    };

    return (
        <div className="employee-page">
            <h2>{getLocalizedString(preferredLang, 'Employees')}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="employees-list">
                {employees.map((employee) => (
                    <div key={employee.id} className="employee-item" onClick={() => handleEmployeeClick(employee.id)}>
                        <p>{employee.name}</p>
                    </div>
                ))}
            </div>
            {selectedEmployeeId && (
                <div className="employee-details">
                    <h3>{getLocalizedString(preferredLang, 'Work Hours')}</h3>
                    {employeeWorkHours ? (
                        <div className="work-hours-details">
                            <p>
                                {getLocalizedString(preferredLang, 'Start Time')}: {employeeWorkHours.startTime}
                            </p>
                            <p>
                                {getLocalizedString(preferredLang, 'End Time')}: {employeeWorkHours.endTime}
                            </p>
                            <p>
                                {getLocalizedString(preferredLang, 'Difference')}:{' '}
                                {calculateTimeDifference(employeeWorkHours.startTime, employeeWorkHours.endTime)}
                            </p>
                        </div>
                    ) : (
                        <p>{getLocalizedString(preferredLang, 'Loading work hours...')}</p>
                    )}
                </div>
            )}
            <NotificationContainer />
        </div>
    );
};

export default EmployeePage;

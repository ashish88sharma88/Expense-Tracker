// script.js

// References to DOM elements
const expenseForm = document.getElementById('expense-form');
const expenseTableBody = document.getElementById('expense-table-body');
const totalAmountSpan = document.getElementById('total-amount');
const monthSelect = document.getElementById('month-select');
const ctx = document.getElementById('expense-chart').getContext('2d');

// Array to store expenses (initialize with saved data if available)
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Initialize the chart
let expenseChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Labels will be updated dynamically
        datasets: [{
            label: 'Expenses',
            data: [], // Data will be updated dynamically
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,

                ticks: {
                    callback: function (value) {
                        return '€' + value.toFixed(2);
                    }
                }
            }
        }
    }
});

// Function to add an expense
function addExpense(name, amount, date) {
    const expense = { name, amount: parseFloat(amount), date };
    expenses.push(expense);
    updateLocalStorage();
    renderExpenses();
    updateTotal();
    updateChart();
}

// Function to render expenses in the table based on the selected month
function renderExpenses() {
    const selectedMonth = monthSelect.value;
    expenseTableBody.innerHTML = '';

    expenses.forEach((expense, index) => {
        const expenseMonth = expense.date.slice(5, 7); // Extract month from date

        if (selectedMonth === 'all' || selectedMonth === expenseMonth) {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${expense.name}</td>
                <td>€${expense.amount.toFixed(2)}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="delete-button" data-index="${index}">Delete</button>
                </td>
            `;

            expenseTableBody.appendChild(row);
        }
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', deleteExpense);
    });
}

// Function to update the total amount based on the selected month
function updateTotal() {
    const selectedMonth = monthSelect.value;
    let total = 0;

    expenses.forEach(expense => {
        const expenseMonth = expense.date.slice(5, 7); // Extract month from date

        if (selectedMonth === 'all' || selectedMonth === expenseMonth) {
            total += expense.amount;
        }
    });

    totalAmountSpan.textContent = total.toFixed(2);
}

// Function to update the chart
function updateChart() {
    const selectedMonth = monthSelect.value;
    const monthLabels = [];
    const monthData = [];

    const filteredExpenses = expenses.filter(expense => {
        const expenseMonth = expense.date.slice(5, 7);
        return selectedMonth === 'all' || selectedMonth === expenseMonth;
    });

    filteredExpenses.forEach(expense => {
        monthLabels.push(expense.name);
        monthData.push(expense.amount);
    });

    // Update chart data
    expenseChart.data.labels = monthLabels;
    expenseChart.data.datasets[0].data = monthData;
    expenseChart.update();
}

// Function to delete an expense
function deleteExpense(event) {
    const index = event.target.dataset.index;
    expenses.splice(index, 1);
    updateLocalStorage();
    renderExpenses();
    updateTotal();
    updateChart();
}

// Function to update localStorage
function updateLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Handle form submission
expenseForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const date = document.getElementById('expense-date').value;

    if (name && amount && date) {
        addExpense(name, amount, date);

        // Clear form fields
        expenseForm.reset();
    }
});

// Handle month selection change
monthSelect.addEventListener('change', function () {
    renderExpenses();
    updateTotal();
    updateChart();
});

// Initial render of expenses from localStorage
renderExpenses();
updateTotal();
updateChart();

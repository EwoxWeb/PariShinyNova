function processCSV() {
    const input = document.getElementById('csvFileInput');
    const targetNumber = document.getElementById('targetNumber').value;
    
    if ('files' in input && input.files.length > 0 && targetNumber !== '') {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            displayCSVData(text, targetNumber);
        };
        reader.readAsText(file);
    }
}

function displayCSVData(csv, targetNumber) {
    const rows = csv.split('\n');
    const tableBody = document.getElementById('csvTableBody');
    tableBody.innerHTML = '';

    const data = [];
    const targetNum = parseInt(targetNumber, 10);

    // Ignore the first row (header)
    for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(',');
        if (columns.length === 4) {
            const rowData = columns.map((column, index) => {
                let value = column.replace(/^"|"$/g, '');
                if (index === 0) {
                    value = formatDate(value);
                }
                if (index === 2 || index === 3) {
                    value = value.replace(/\D/g, '').replace(/^0+/, '');
                }
                return value.trim(); // Trim whitespace
            });
            data.push(rowData);
        }
    }

    data.sort((a, b) => {
        const closestA = getClosestValue(a, targetNum);
        const closestB = getClosestValue(b, targetNum);
        return closestA.distance - closestB.distance;
    });

    data.forEach((rowData, rowIndex) => {
        const tr = document.createElement('tr');

        rowData.forEach((value, index) => {
            const td = document.createElement('td');
            td.textContent = value;

            if (rowIndex === 0) {
                const closestIndex = getClosestIndex(rowData, targetNum);
                if (index === closestIndex) {
                    td.classList.add('red');
                }
            } else {
                const closestIndex = getClosestIndex(rowData, targetNum);
                if (index === closestIndex) {
                    td.classList.add('blue');
                }
            }

            tr.appendChild(td);
        });

        // Add the "Écart" column
        const closestIndex = getClosestIndex(rowData, targetNum);
        const tdEcart = document.createElement('td');
        tdEcart.textContent = closestIndex !== -1 ? Math.abs(parseInt(rowData[closestIndex], 10) - targetNum) : '-';
        tr.appendChild(tdEcart);

        // Add class to the whole row based on position
        if (rowIndex === 0) {
            tr.classList.add('gold');
        } else if (rowIndex === 1) {
            tr.classList.add('silver');
        } else if (rowIndex === 2) {
            tr.classList.add('bronze');
        }

        tableBody.appendChild(tr);
    });

    document.getElementById('csvTable').style.display = 'table';
}

function getClosestValue(rowData, targetNum) {
    let closestValue = Infinity;
    let closestIndex = -1;

    for (let index = 2; index <= 3; index++) {
        if (rowData[index] !== '') {
            const numValue = parseInt(rowData[index], 10);
            const diff = Math.abs(numValue - targetNum);
            if (diff < closestValue) {
                closestValue = diff;
                closestIndex = index;
            }
        }
    }

    return { index: closestIndex, distance: closestValue };
}

function getClosestIndex(rowData, targetNum) {
    const closestValue = getClosestValue(rowData, targetNum);
    return closestValue.index;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}
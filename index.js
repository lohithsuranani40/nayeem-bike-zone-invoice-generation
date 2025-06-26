// Get DOM elements
const invoiceForm = document.getElementById('invoiceForm');
const invoicePreview = document.getElementById('invoicePreview');
const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
const editInvoiceBtn = document.getElementById('editInvoiceBtn');
const printInvoiceBtn = document.getElementById('printInvoiceBtn');
const messageBox = document.getElementById('messageBox');
const invoiceNumberInput = document.getElementById('invoiceNumber');
const tdCheck = document.getElementById('tdCheck');
const tdFields = document.getElementById('tdFields');
const dueDateField = document.getElementById('dueDateField');
const dueDateInput = document.getElementById('dueDate');
const tdDetailsDisplaySection = document.getElementById('tdDetailsDisplaySection');
const tdSignatureBox = document.getElementById('tdSignatureBox');
const totalAmountInWordsDisplay = document.getElementById('totalAmountInWordsDisplay'); // Re-added this element

// Invoice counter key for localStorage
const INVOICE_COUNTER_KEY = 'invoiceCounter';

// Utility function to display messages (replaces alert())
function displayMessage(msg, type = 'success') {
    messageBox.textContent = msg;
    messageBox.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'bg-green-100', 'text-green-800');
    if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'text-red-800');
    } else {
        messageBox.classList.add('bg-green-100', 'text-green-800');
    }
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 3000); // Hide after 3 seconds
}

// Utility function to convert number to words (for Indian English)
function convertNumberToWords(num) {
    if (num === 0) return "Zero Rupees Only";

    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const thousands = ["", "Thousand", "Lakh", "Crore"];

    let result = "";
    let integerPart = Math.floor(num);
    let decimalPart = Math.round((num - integerPart) * 100); // Get two decimal places

    // Helper for converting a number chunk (max 3 digits)
    function convertChunk(n) {
        let s = "";
        if (n >= 100) {
            s += units[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 10 && n <= 19) {
            s += teens[n - 10] + " ";
        } else if (n >= 20) {
            s += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n >= 1 && n <= 9) {
            s += units[n] + " ";
        }
        return s;
    }

    // Indian Numbering System logic
    let parts = [];
    // Crores
    if (integerPart >= 10000000) {
        parts.push(convertChunk(Math.floor(integerPart / 10000000)) + "Crore");
        integerPart %= 10000000;
    }
    // Lakhs
    if (integerPart >= 100000) {
        parts.push(convertChunk(Math.floor(integerPart / 100000)) + "Lakh");
        integerPart %= 100000;
    }
    // Thousands
    if (integerPart >= 1000) {
        parts.push(convertChunk(Math.floor(integerPart / 1000)) + "Thousand");
        integerPart %= 1000;
    }
    // Hundreds and remaining
    if (integerPart > 0) {
        parts.push(convertChunk(integerPart));
    }

    result = parts.join(" ").trim();

    if (result === "") {
        result = "Zero";
    }

    result += " Rupees";

    // Handle decimal part
    if (decimalPart > 0) {
        result += " and " + convertChunk(decimalPart).trim() + " Paisa";
    }

    return result.trim() + " Only";
}


// Function to update calculated fields in the form dynamically
function updateCalculatedFields() {
    const price = parseFloat(document.getElementById('price').value) || 0;
    const paid = parseFloat(document.getElementById('paid').value) || 0;
    const total = price; // Total is initially the price
    const due = price - paid;

    document.getElementById('displayTotal').textContent = `₹${total.toFixed(2)}`;
    document.getElementById('displayDue').textContent = `₹${due.toFixed(2)}`;

    // Conditional display of Due Date field
    if (due > 0) {
        dueDateField.classList.remove('hidden');
        console.log('Due amount > 0. Due Date field should be visible.');
    } else {
        dueDateField.classList.add('hidden');
        dueDateInput.value = ''; // Clear date if due is 0 or less
        console.log('Due amount <= 0. Due Date field is hidden.');
    }
    console.log('Current Due amount:', due);
}

// Function to get the next invoice number (for incrementing)
function getNextInvoiceCounterValue() {
    let currentCounter = parseInt(localStorage.getItem(INVOICE_COUNTER_KEY)) || 0;
    return currentCounter + 1;
}

// Function to increment and save invoice number
function incrementInvoiceNumberInStorage() {
    let currentCounter = parseInt(localStorage.getItem(INVOICE_COUNTER_KEY)) || 0;
    currentCounter++;
    localStorage.setItem(INVOICE_COUNTER_KEY, currentCounter);
}

// Add event listeners for price and paid inputs to update calculated fields
document.getElementById('price').addEventListener('input', updateCalculatedFields);
document.getElementById('paid').addEventListener('input', updateCalculatedFields);

// TD Checkbox Listener
tdCheck.addEventListener('change', () => {
    if (tdCheck.checked) {
        tdFields.classList.remove('hidden');
    } else {
        tdFields.classList.add('hidden');
        document.getElementById('tdName').value = '';
        document.getElementById('tdNumber').value = '';
    }
});

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set current date
    document.getElementById('invoiceDate').value = new Date().toISOString().substring(0, 10);
    // Set the invoice number to the *next* counter value on load
    invoiceNumberInput.value = getNextInvoiceCounterValue().toString().padStart(3, '0'); // Show the next number initially
    updateCalculatedFields(); // Initial calculation and words update
});


// Generate Invoice Functionality
generateInvoiceBtn.addEventListener('click', () => {
    // Get values from form inputs
    const invoiceNumber = invoiceNumberInput.value; // Get the displayed invoice number
    const invoiceDate = document.getElementById('invoiceDate').value;
    const billToName = document.getElementById('billToName').value;
    const billToS_o = document.getElementById('billToS_o').value;
    const billToAddress = document.getElementById('billToAddress').value;
    const billToCell = document.getElementById('billToCell').value;
    const tdName = document.getElementById('tdName').value;
    const tdNumber = document.getElementById('tdNumber').value;
    const makersName = document.getElementById('makersName').value;
    const registeredOwner = document.getElementById('registeredOwner').value;
    const regNo = document.getElementById('regNo').value;
    const bikeModel = document.getElementById('bikeModel').value;
    const chassisNumber = document.getElementById('chassisNumber').value;
    const engineNumber = document.getElementById('engineNumber').value;
    const colour = document.getElementById('colour').value;
    const documentsCheckboxes = document.querySelectorAll('input[name="documents"]:checked');
    const price = parseFloat(document.getElementById('price').value) || 0;
    const paid = parseFloat(document.getElementById('paid').value) || 0;
    const dueDate = document.getElementById('dueDate').value;

    // The totalAmountInWords is now generated
    const totalAmountInWords = convertNumberToWords(price);

    // Collect selected documents
    const selectedDocuments = Array.from(documentsCheckboxes).map(cb => cb.value).join(', ');

    // Basic validation
    if (!billToName || !makersName || price <= 0) {
        displayMessage('Please fill in Customer Name, Maker\'s Name, and Price (must be greater than 0) to generate the invoice.', 'error');
        return;
    }

    // Chassis and Engine Number validation (5 digits)
    // Ensure inputs are treated as strings for length check and then converted back to number for comparison
    const chassisNumStr = String(chassisNumber);
    const engineNumStr = String(engineNumber);

    if (chassisNumStr && (chassisNumStr.length !== 5 || isNaN(parseInt(chassisNumStr)))) {
        displayMessage('Chassis Number must be exactly 5 numeric digits.', 'error');
        return;
    }
    if (engineNumStr && (engineNumStr.length !== 5 || isNaN(parseInt(engineNumStr)))) {
        displayMessage('Engine Number must be exactly 5 numeric digits.', 'error');
        return;
    }


    // Calculate totals
    const total = price;
    const due = price - paid;

    // Populate invoice preview
    document.getElementById('invoiceNoDisplay').textContent = invoiceNumber || '-';
    document.getElementById('invoiceDateDisplay').textContent = invoiceDate || '-';
    document.getElementById('billToNameDisplay').textContent = billToName || '-';
    document.getElementById('billToSoDisplay').textContent = billToS_o || '-';
    document.getElementById('billToAddressDisplay').textContent = billToAddress || '-';
    document.getElementById('billToCellDisplay').textContent = billToCell || '-';

    // Populate TD details conditionally
    if (tdCheck.checked) {
        tdDetailsDisplaySection.classList.remove('hidden');
        tdSignatureBox.classList.remove('hidden');
        document.getElementById('tdNameDisplay').textContent = tdName || '-';
        document.getElementById('tdNumberDisplay').textContent = tdNumber || '-';
    } else {
        tdDetailsDisplaySection.classList.add('hidden');
        tdSignatureBox.classList.add('hidden');
    }

    document.getElementById('makersNameDisplay').textContent = makersName || '-';
    document.getElementById('registeredOwnerDisplay').textContent = registeredOwner || '-';
    document.getElementById('regNoDisplay').textContent = regNo || '-';
    document.getElementById('bikeModelDisplay').textContent = bikeModel || '-';
    document.getElementById('chassisNumberDisplay').textContent = chassisNumber || '-';
    document.getElementById('engineNumberDisplay').textContent = engineNumber || '-';
    document.getElementById('colourDisplay').textContent = colour || '-';
    document.getElementById('documentsDisplay').textContent = selectedDocuments || '-';
    document.getElementById('priceDisplay').textContent = `₹${price.toFixed(2)}`;
    document.getElementById('paidDisplay').textContent = `₹${paid.toFixed(2)}`;
    document.getElementById('dueDisplay').textContent = `₹${due.toFixed(2)}`;
    document.getElementById('totalDisplay').textContent = `₹${total.toFixed(2)}`;

    // Populate and show Due Date conditionally
    const dueDateDisplayContainer = document.getElementById('dueDateDisplayContainer');
    if (due > 0 && dueDate) {
        dueDateDisplayContainer.classList.remove('hidden');
        document.getElementById('dueDateDisplay').textContent = dueDate;
    } else {
        dueDateDisplayContainer.classList.add('hidden');
    }

    // Show invoice and hide form
    invoiceForm.classList.add('hidden');
    invoicePreview.classList.remove('hidden');
    displayMessage('Invoice generated successfully!', 'success');
});

// Edit Invoice Functionality (show form, hide invoice)
editInvoiceBtn.addEventListener('click', () => {
    invoicePreview.classList.add('hidden');
    invoiceForm.classList.remove('hidden');
    // When editing, do NOT increment. The invoice number stays the same.
    displayMessage('You can now edit the invoice details. Counter will increment only on print.', 'success');
});

// Print Invoice Functionality
printInvoiceBtn.addEventListener('click', () => {
    // Get data for filename
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const regNumber = document.getElementById('regNo').value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20); // Sanitize and limit length
    const customerName = document.getElementById('billToName').value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30); // Sanitize and limit length

    // Set the document title before printing to influence the default save filename
    document.title = `Invoice_${invoiceNumber}_${regNumber}_${customerName}`;

    // Increment the counter and save it after successful print
    incrementInvoiceNumberInStorage();
    // Add a class to body to hide print-hide elements
    document.body.classList.add('printing');
    window.print();
    // Remove the class after print dialog is closed
    document.body.classList.remove('printing');
    displayMessage('Invoice sent to printer!', 'success');
    // After printing, update the form's invoice number for the *next* potential invoice
    invoiceNumberInput.value = getNextInvoiceCounterValue().toString().padStart(3, '0');
});
/* ==================================
  GLOBAL VARIABLES
===================================== */

const form = document.querySelector('form');
const nameField = document.getElementById('name');
const jobRoleField = document.getElementById('title');
const otherJobRoleField = document.getElementById('other-job-role');
const shirtDesignField = document.getElementById('design');
const shirtColorField = document.getElementById('color');
const activities = document.getElementById('activities');
const activitiesFields = activities.querySelectorAll('[type="checkbox"]');
const paymentField = document.getElementById('payment');
const requiredFields = document.querySelectorAll('.error-border');

nameField.focus(); // Set auto focus for the first field
otherJobRoleField.style.display = 'none'; // Hide other job role field by default
shirtColorField.disabled = true; // Disable color field by default
paymentField.selectedIndex = 1; // Choose credit card option for paymentField by default
document.getElementById('paypal').style.display = 'none'; // Hide paypal field by default
document.getElementById('bitcoin').style.display = 'none'; // Hide bitcoin field by default

/* ==================================
  HELPERS
===================================== */

// --- Validation ---
const validationSchema = {
  checkName: name => name !== '',
  checkEmail: email => /^([a-zA-Z\-0-9.]+)@([a-zA-Z\-0-9]+).com$/.test(email),
  checkActivities: () => activities.querySelector('[type="checkbox"]:checked') ? true : false,
  checkExpiryMonth: () => document.getElementById('exp-month').selectedIndex !== 0,
  checkExpiryYear: () => document.getElementById('exp-year').selectedIndex !== 0,
  checkCCNum: () => /^[0-9]{13}$|^[0-9]{16}$/.test(document.getElementById('cc-num').value),
  checkZip: () => /^[0-9]{5}$/.test(document.getElementById('zip').value),
  checkCVV: () => /^[0-9]{3}$/.test(document.getElementById('cvv').value),
}

const isValid = field => {
  if (field.id === 'name') return validationSchema.checkName(field.value);
  if (field.id === 'email') return validationSchema.checkEmail(field.value);
  if (field.id === 'activities-box') return validationSchema.checkActivities();
  // If the credit card option is selected run the validation
  if (paymentField.selectedIndex === 1) {
    if (field.id === 'exp-month') return validationSchema.checkExpiryMonth();
    if (field.id === 'exp-year') return validationSchema.checkExpiryYear();
    if (field.id === 'cc-num') return validationSchema.checkCCNum();
    if (field.id === 'zip') return validationSchema.checkZip();
    if (field.id === 'cvv') return validationSchema.checkCVV();
    // otherwise, skip with setting validation to true
  } else {
    return true;
  }
}

const handleInput = (input, label, hint) => {
  input.addEventListener('keyup', () => {
    isValid(input) ? hideError(label, hint) : showError(label, hint)
  });
}

const handleSelect = (select, label, hint) => {
  select.addEventListener('blur', () => {
    isValid(select) ? hideError(label, hint) : showError(label, hint)
  });
  select.addEventListener('change', () => {
    isValid(select) ? hideError(label, hint) : showError(label, hint)
  });
}

const handleActivityChange = (chosenField, field, label) => {
  const chosenDate = chosenField.getAttribute('data-day-and-time');
  const fieldDate = field.getAttribute('data-day-and-time');
  if (field !== chosenField && fieldDate === chosenDate) {
    field.disabled = true;
    label.classList.add('disabled');
  }
  if (!chosenField.checked && field.disabled && fieldDate === chosenDate) {
    field.disabled = false;
    label.classList.remove('disabled');
  }
}

// --- Elements ---
const showError = (label, hint) => {
  label.classList.add('not-valid');
  label.classList.remove('valid');
  hint.style.display = 'block';
}

const hideError = (label, hint) => {
  label.classList.add('valid');
  label.classList.remove('not-valid');
  hint.style.display = '';
}

/* ==================================
  EVENT HANDLERS
===================================== */

// --- Required fields ---
requiredFields.forEach(field => {
  const label = field.parentElement;
  const hint = label.lastElementChild;
  if (field.tagName === 'INPUT') {
    handleInput(field, label, hint);
  }
  if (field.tagName === 'SELECT') {
    handleSelect(field, label, hint);
  }
});

// --- Job role field ---
jobRoleField.addEventListener('change', function () {
  this.value === 'other' ? otherJobRoleField.style.display = 'block' : otherJobRoleField.style.display = 'none';
});

// --- shirt design field ---
shirtDesignField.addEventListener('change', function () {
  shirtColorField.disabled = false;
  for (option of shirtColorField.options) {
    option.getAttribute('data-theme') !== this.value ? option.hidden = true : option.hidden = false;
  }
  shirtColorField.querySelector(`[data-theme="${this.value}"]`).selected = true;
});

// --- activities field ---
activities.addEventListener('change', e => {
  const total = document.getElementById('activities-cost');
  let price = 0;
  const chosenField = e.target;
  activitiesFields.forEach(field => {
    const label = field.parentElement;
    handleActivityChange(chosenField, field, label);
    field.addEventListener('focus', () => label.classList.add('focus'));
    field.addEventListener('blur', () => label.classList.remove('focus'));
    field.checked ? price += parseInt(field.getAttribute('data-cost')) : null;
  });
  total.textContent = `Total: $${price}`;
});

// --- payment field ---
paymentField.addEventListener('change', function () {
  for (option of paymentField.options) {
    if (option.index > 0) {
      option.value !== this.value
        ? document.getElementById(`${option.value}`).style.display = 'none'
        : document.getElementById(`${option.value}`).style.display = '';
    }
  }
});

// --- form ---
form.addEventListener('submit', e => {
  requiredFields.forEach(field => {
    const label = field.parentElement;
    const hint = label.lastElementChild;
    if (isValid(field)) {
      hideError(label, hint);
    } else {
      showError(label, hint);
      if (field.id === 'email') {
        const emailHint = document.getElementById('email-hint');
        field.value === '' ? emailHint.textContent = 'Enter an email address' : emailHint.textContent = 'Email address must be formatted correctly';
      }
      e.preventDefault();
    }
  });
});
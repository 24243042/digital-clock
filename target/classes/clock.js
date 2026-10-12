const timeElement = document.querySelector('#clock-time');
const secondsElement = document.querySelector('#clock-seconds');
const periodElement = document.querySelector('#clock-period');
const dateElement = document.querySelector('#clock-date');
const zoneLabel = document.querySelector('#zone-label');
const zoneDetail = document.querySelector('#timezone-detail');
const zoneSelect = document.querySelector('#timezone-select');
const secondsToggle = document.querySelector('#seconds-toggle');
const formatButtons = [...document.querySelectorAll('[data-format]')];
const fullscreenButton = document.querySelector('#fullscreen-button');

const preferences = JSON.parse(localStorage.getItem('clock-preferences') || '{}');
let hourCycle = preferences.hourCycle || 'h23';
let showSeconds = preferences.showSeconds !== false;
let timeZone = preferences.timeZone || 'local';

if (!['h12', 'h23'].includes(hourCycle)) hourCycle = 'h23';
if (![...zoneSelect.options].some((option) => option.value === timeZone)) timeZone = 'local';
zoneSelect.value = timeZone;
secondsToggle.checked = showSeconds;

function selectedZone() {
  return timeZone === 'local' ? undefined : timeZone;
}

function savePreferences() {
  localStorage.setItem('clock-preferences', JSON.stringify({ hourCycle, showSeconds, timeZone }));
}

function updateClock() {
  const now = new Date();
  const zone = selectedZone();
  const timeParts = new Intl.DateTimeFormat(undefined, {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle
  }).formatToParts(now);
  const values = Object.fromEntries(timeParts.map(({ type, value }) => [type, value]));

  timeElement.textContent = `${values.hour}:${values.minute}`;
  secondsElement.textContent = values.second;
  secondsElement.hidden = !showSeconds;
  periodElement.textContent = values.dayPeriod || '';
  periodElement.hidden = !values.dayPeriod;
  dateElement.textContent = new Intl.DateTimeFormat(undefined, {
    timeZone: zone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(now);

  const zoneName = timeZone === 'local'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : timeZone;
  const city = timeZone === 'local'
    ? 'LOCAL TIME'
    : timeZone === 'UTC'
      ? 'UNIVERSAL TIME'
      : `${timeZone.split('/').at(-1).replaceAll('_', ' ').toUpperCase()} TIME`;
  zoneLabel.textContent = city;
  zoneDetail.textContent = zoneName;
}

formatButtons.forEach((button) => {
  button.setAttribute('aria-pressed', String(button.dataset.format === (hourCycle === 'h12' ? '12' : '24')));
  button.addEventListener('click', () => {
    hourCycle = button.dataset.format === '12' ? 'h12' : 'h23';
    formatButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    savePreferences();
    updateClock();
  });
});

secondsToggle.addEventListener('change', () => {
  showSeconds = secondsToggle.checked;
  savePreferences();
  updateClock();
});

zoneSelect.addEventListener('change', () => {
  timeZone = zoneSelect.value;
  savePreferences();
  updateClock();
});

fullscreenButton.addEventListener('click', async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await document.documentElement.requestFullscreen();
  }
  fullscreenButton.firstChild.textContent = document.fullscreenElement ? 'Exit full screen ' : 'Full screen ';
});

document.addEventListener('fullscreenchange', () => {
  fullscreenButton.firstChild.textContent = document.fullscreenElement ? 'Exit full screen ' : 'Full screen ';
});

updateClock();
window.setInterval(updateClock, 1000);

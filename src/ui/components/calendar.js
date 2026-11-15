/**
 * Calendar — Progressive Enhancement
 *
 * Enhances a static `.uif-calendar` element with:
 * - Month navigation (prev/next buttons rebuild the grid)
 * - Keyboard navigation (arrow keys, Home/End, PageUp/PageDown)
 * - Date selection (click/Enter updates aria-selected)
 * - Today highlighting
 *
 * Usage:
 *   import { Calendar } from './components/calendar.js';
 *   document.querySelectorAll('.uif-calendar').forEach(el => new Calendar(el));
 */

const CALENDAR_ROOT_SELECTOR = ":is(.uif-calendar, .calendar)";
const CALENDAR_TITLE_SELECTOR = ":is(.uif-calendar-title, .calendar-title)";
const CALENDAR_TABLE_SELECTOR = ":is(.uif-calendar-table, .calendar-table)";
const CALENDAR_CELL_SELECTOR = "button:is(.uif-calendar-cell, .calendar-cell)";

export class Calendar {
  /**
   * @param {HTMLElement} root - The .uif-calendar element to enhance
   * @param {object} [options]
   * @param {string} [options.locale] - Intl locale (default: "en-GB")
   * @param {Date} [options.min] - Earliest selectable date
   * @param {Date} [options.max] - Latest selectable date
   * @param {function} [options.onSelect] - Callback when date is selected
   */
  constructor(root, options = {}) {
    this.root = root;
    this.root.setAttribute("data-enhanced", "");
    this.locale = options.locale || "en-GB";
    this.min = options.min || null;
    this.max = options.max || null;
    this.onSelect = options.onSelect || null;

    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);

    // Parse initial month from the title element
    this.currentMonth = this._parseInitialMonth();
    this.selectedDate = null;

    // Cache DOM references
    this.titleEl = root.querySelector(CALENDAR_TITLE_SELECTOR);
    this.monthSelect = root.querySelector('select[name="month"]');
    this.yearSelect = root.querySelector('select[name="year"]');
    this.tableBody = root.querySelector(`${CALENDAR_TABLE_SELECTOR} tbody`);
    this.prevBtn = root.querySelector("[aria-label='Previous month']");
    this.nextBtn = root.querySelector("[aria-label='Next month']");
    this.disabled = options.disabled === true || Boolean(this.prevBtn?.disabled && this.nextBtn?.disabled);

    this._bindEvents();
    this._render();
  }

  // ─── Event Binding ──────────────────────────────────────────────

  _bindEvents() {
    this.prevBtn?.addEventListener("click", () => this._navigate(-1));
    this.nextBtn?.addEventListener("click", () => this._navigate(1));
    this.root.addEventListener("click", (e) => this._handleCellClick(e));
    this.root.addEventListener("keydown", (e) => this._handleKeyDown(e));
    for (const select of [this.monthSelect, this.yearSelect]) {
      select?.addEventListener("change", () => {
        const year = Number(this.yearSelect?.value ?? this.currentMonth.getFullYear());
        const month = Number(this.monthSelect?.value ?? this.currentMonth.getMonth());
        this.currentMonth = new Date(year, month, 1);
        this._render();
      });
    }
  }

  // ─── Navigation ─────────────────────────────────────────────────

  _navigate(delta) {
    if (this.disabled) return;
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth() + delta;
    this.currentMonth = new Date(year, month, 1);
    this._render();
  }

  // ─── Selection ──────────────────────────────────────────────────

  _handleCellClick(e) {
    const btn = e.target.closest(CALENDAR_CELL_SELECTOR);
    if (!btn || btn.disabled) return;

    const date = this._dateFromCell(btn);
    if (date) this._selectDate(date);
  }

  _selectDate(date) {
    this.selectedDate = date;
    this._render();

    if (this.onSelect) {
      this.onSelect(date);
    }

    // Dispatch custom event
    this.root.dispatchEvent(
      new CustomEvent("calendar:select", { detail: { date }, bubbles: true }),
    );
  }

  // ─── Keyboard ───────────────────────────────────────────────────

  _handleKeyDown(e) {
    const btn = e.target.closest(CALENDAR_CELL_SELECTOR);
    if (!btn) return;

    const cells = [...this.tableBody.querySelectorAll(CALENDAR_CELL_SELECTOR)];
    const index = cells.indexOf(btn);
    if (index === -1) return;

    let target = null;

    switch (e.key) {
      case "ArrowLeft":
        target = index - 1;
        break;
      case "ArrowRight":
        target = index + 1;
        break;
      case "ArrowUp":
        target = index - 7;
        break;
      case "ArrowDown":
        target = index + 7;
        break;
      case "Home":
        target = index - (index % 7);
        break;
      case "End":
        target = index - (index % 7) + 6;
        break;
      case "PageUp":
        e.preventDefault();
        this._navigate(-1);
        return;
      case "PageDown":
        e.preventDefault();
        this._navigate(1);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        this._handleCellClick(e);
        return;
      default:
        return;
    }

    e.preventDefault();

    if (target >= 0 && target < cells.length && !cells[target].disabled) {
      cells.forEach(cell => { cell.tabIndex = -1; });
      cells[target].tabIndex = 0;
      cells[target].focus();
    }
  }

  // ─── Rendering ──────────────────────────────────────────────────

  _render() {
    const active = this.root.ownerDocument.activeElement;
    const focused = this.root.contains(active) && active.matches?.(CALENDAR_CELL_SELECTOR)
      ? { iso: active.dataset.date, day: Number(active.textContent) }
      : null;
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // Update title
    const formatter = new Intl.DateTimeFormat(this.locale, {
      month: "long",
      year: "numeric",
    });
    if (this.titleEl) this.titleEl.textContent = formatter.format(this.currentMonth);
    this.root.querySelector(CALENDAR_TABLE_SELECTOR)?.setAttribute("aria-label", formatter.format(this.currentMonth));
    if (this.monthSelect) this.monthSelect.value = String(month);
    if (this.yearSelect) {
      if (![...this.yearSelect.options].some(option => option.value === String(year))) {
        this.yearSelect.add(new Option(String(year), String(year)));
      }
      this.yearSelect.value = String(year);
    }

    // Calculate grid
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = lastDay.getDate();

    // Previous month fill
    const prevMonthLast = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = startDow - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthLast - i,
        date: new Date(year, month - 1, prevMonthLast - i),
        outside: true,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, date: new Date(year, month, d), outside: false });
    }

    // Next month fill
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        cells.push({
          day: d,
          date: new Date(year, month + 1, d),
          outside: true,
        });
      }
    }

    // Build rows
    const dateFormatter = new Intl.DateTimeFormat(this.locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    let html = "";
    for (let i = 0; i < cells.length; i += 7) {
      html += "<tr>";
      for (let j = i; j < i + 7 && j < cells.length; j++) {
        const cell = cells[j];
        const classes = ["uif-calendar-cell"];
        const isSelected = this._isSameDay(cell.date, this.selectedDate);
        const isToday = this._isSameDay(cell.date, this.today);
        const isDisabled = this._isDisabled(cell.date);

        if (cell.outside) classes.push("is-outside-month");
        if (isSelected) classes.push("is-selected");
        if (isToday) classes.push("is-today");
        if (isDisabled) classes.push("is-disabled");

        const tabindex =
          isSelected || (!this.selectedDate && isToday) ? "0" : "-1";

        html += `<td><button type="button"
          class="${classes.join(" ")}"
          aria-selected="${isSelected}"
          aria-label="${dateFormatter.format(cell.date)}"
          tabindex="${tabindex}"
          ${isDisabled ? "disabled" : ""}
          data-date="${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, "0")}-${String(cell.date.getDate()).padStart(2, "0")}"
        >${cell.day}</button></td>`;
      }
      html += "</tr>";
    }

    this.tableBody.innerHTML = html;
    const enabled = [...this.tableBody.querySelectorAll(CALENDAR_CELL_SELECTOR)].filter(cell => !cell.disabled);
    const firstCurrent = enabled.find(cell => !cell.classList.contains("is-outside-month"));
    if (!enabled.some(cell => cell.tabIndex === 0) && firstCurrent) firstCurrent.tabIndex = 0;
    if (focused) {
      const replacement = enabled.find(cell => cell.dataset.date === focused.iso)
        || enabled.find(cell => !cell.classList.contains("is-outside-month") && Number(cell.textContent) === focused.day)
        || firstCurrent;
      if (replacement) {
        enabled.forEach(cell => { cell.tabIndex = -1; });
        replacement.tabIndex = 0;
        replacement.focus();
      }
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────

  _parseInitialMonth() {
    const grid = this.root.querySelector(CALENDAR_TABLE_SELECTOR);
    const month = grid?.getAttribute("aria-label")?.match(/^(\d{4})-(\d{2})$/);
    if (month) return new Date(Number(month[1]), Number(month[2]) - 1, 1);
    const titleEl = this.root.querySelector(CALENDAR_TITLE_SELECTOR);
    if (titleEl) {
      const parsed = new Date(titleEl.textContent);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date(this.today.getFullYear(), this.today.getMonth(), 1);
  }

  _dateFromCell(btn) {
    const iso = btn.dataset.date;
    const parts = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (parts) return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
    return null;
  }

  _isSameDay(a, b) {
    if (!a || !b) return false;
    return a.toDateString() === b.toDateString();
  }

  _isDisabled(date) {
    if (this.disabled) return true;
    if (this.min && date < this.min) return true;
    if (this.max && date > this.max) return true;
    return false;
  }
}

// Auto-init: enhance all .uif-calendar elements on DOMContentLoaded
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    document
      .querySelectorAll(`${CALENDAR_ROOT_SELECTOR}:not([data-enhanced])`)
      .forEach((el) => {
        el.setAttribute("data-enhanced", "");
        new Calendar(el);
      });
  });
}

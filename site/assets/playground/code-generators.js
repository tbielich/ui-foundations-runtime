(function initCodeGenerators(global) {
  var shared = global.UIPlaygroundShared || {};
  var quoteAttr = shared.quoteAttr || function (v) { return String(v || ""); };

  function njkButton(state) {
    var p = state.props;
    var label = state.children || "Button";
    var variant = p.variant || "";
    var disabled = Boolean(p.disabled) || state.meta.state === "disabled";
    var parts = ['"' + quoteAttr(label) + '"'];
    if (variant && variant !== "solid") parts.push('"' + variant + '"');
    else if (disabled) parts.push('""');
    if (disabled) parts.push("true");
    return '{{ uif.button(' + parts.join(", ") + ') }}';
  }

  function wcButton(state) {
    var p = state.props;
    var label = state.children || "Button";
    var variant = p.variant || "solid";
    var disabled = Boolean(p.disabled) || state.meta.state === "disabled";
    var attrs = [];
    if (variant !== "solid") attrs.push('variant="' + variant + '"');
    if (p.startIcon) attrs.push('start-icon="' + quoteAttr(p.startIcon) + '"');
    if (disabled) attrs.push("disabled");
    return "<uif-button" + (attrs.length ? " " + attrs.join(" ") : "") + ">" + quoteAttr(label) + "</uif-button>";
  }

  function njkInput(state) {
    var p = state.props;
    var parts = [];
    if (p.type && p.type !== "text") parts.push('type="' + p.type + '"');
    if (p.placeholder) parts.push('placeholder="' + quoteAttr(p.placeholder) + '"');
    if (p.value) parts.push('value="' + quoteAttr(p.value) + '"');
    if (state.meta.state === "disabled") parts.push("disabled=true");
    return "{{ uif.input(" + parts.join(", ") + ") }}";
  }

  function wcInput(state) {
    var p = state.props;
    var attrs = [];
    if (p.type && p.type !== "text") attrs.push('type="' + p.type + '"');
    if (p.placeholder) attrs.push('placeholder="' + quoteAttr(p.placeholder) + '"');
    if (p.value) attrs.push('value="' + quoteAttr(p.value) + '"');
    if (state.meta.state === "disabled") attrs.push("disabled");
    return "<uif-input" + (attrs.length ? " " + attrs.join(" ") : "") + "></uif-input>";
  }

  function njkCheckbox(state) {
    var p = state.props;
    var label = p.label || "Accept terms";
    var checked = p.checked === true || p.checked === "true";
    var disabled = state.meta.state === "disabled";
    var parts = ['"' + quoteAttr(label) + '"'];
    if (checked) parts.push("true");
    else if (disabled) parts.push("false");
    if (disabled) parts.push("true");
    return "{{ uif.checkbox(" + parts.join(", ") + ") }}";
  }

  function wcCheckbox(state) {
    var p = state.props;
    var label = p.label || "Accept terms";
    var checked = p.checked === true || p.checked === "true";
    var disabled = state.meta.state === "disabled";
    var attrs = ['label="' + quoteAttr(label) + '"'];
    if (checked) attrs.push("checked");
    if (disabled) attrs.push("disabled");
    return "<uif-checkbox " + attrs.join(" ") + "></uif-checkbox>";
  }

  function njkSwitch(state) {
    var p = state.props;
    var label = p.label || "Notifications";
    var checked = p.checked === true || p.checked === "true";
    var disabled = state.meta.state === "disabled";
    var parts = ['"' + quoteAttr(label) + '"'];
    if (checked) parts.push("true");
    else if (disabled) parts.push("false");
    if (disabled) parts.push("true");
    return "{{ uif.switch(" + parts.join(", ") + ") }}";
  }

  function wcSwitch(state) {
    var p = state.props;
    var label = p.label || "Notifications";
    var checked = p.checked === true || p.checked === "true";
    var disabled = state.meta.state === "disabled";
    var attrs = ['label="' + quoteAttr(label) + '"'];
    if (checked) attrs.push("checked");
    if (disabled) attrs.push("disabled");
    return "<uif-switch " + attrs.join(" ") + "></uif-switch>";
  }

  function njkIcon(state) {
    var p = state.props;
    var name = p.name || "search";
    var label = p.label || "";
    var parts = ['"' + quoteAttr(name) + '"'];
    if (label) parts.push('"' + quoteAttr(label) + '"');
    return "{{ uif.icon(" + parts.join(", ") + ") }}";
  }

  function wcIcon(state) {
    var p = state.props;
    var name = p.name || "search";
    var label = p.label || "";
    var attrs = ['name="' + quoteAttr(name) + '"'];
    if (label) attrs.push('label="' + quoteAttr(label) + '"');
    else attrs.push("decorative");
    return "<uif-icon " + attrs.join(" ") + "></uif-icon>";
  }

  function njkRadio(state) {
    var p = state.props;
    var label = p.label || "Option A";
    var checked = p.checked === true || p.checked === "true";
    return '{{ uif.radio("' + quoteAttr(label) + '"' + (checked ? ", true" : "") + ') }}';
  }

  function wcRadio(state) {
    var p = state.props;
    var label = p.label || "Option A";
    var checked = p.checked === true || p.checked === "true";
    var attrs = ['label="' + quoteAttr(label) + '"'];
    if (checked) attrs.push("checked");
    return "<uif-radio " + attrs.join(" ") + "></uif-radio>";
  }

  function njkBadge(state) {
    var p = state.props;
    var text = state.children || "Badge";
    var variant = p.variant || "default";
    var parts = ['"' + quoteAttr(text) + '"'];
    if (variant !== "default") parts.push('variant="' + variant + '"');
    return "{{ uif.badge(" + parts.join(", ") + ") }}";
  }

  function wcBadge(state) {
    var p = state.props;
    var text = state.children || "Badge";
    var variant = p.variant || "default";
    var attrs = [];
    if (variant !== "default") attrs.push('variant="' + variant + '"');
    return "<uif-badge" + (attrs.length ? " " + attrs.join(" ") : "") + ">" + quoteAttr(text) + "</uif-badge>";
  }

  function njkSelect(state) {
    var p = state.props;
    var placeholder = p.placeholder || "Choose an option";
    var disabled = state.meta.state === "disabled";
    var useOptgroups = p.optgroups === true || p.optgroups === "true";
    var parts = [];
    if (useOptgroups) {
      parts.push('options=[{group: "Fruits", items: [{value: "apple", label: "Apple"}, {value: "banana", label: "Banana"}]}, {group: "Vegetables", items: [{value: "carrot", label: "Carrot"}]}]');
    } else {
      parts.push('options=[{value: "opt1", label: "Option 1"}, {value: "opt2", label: "Option 2"}, {value: "opt3", label: "Option 3"}]');
    }
    parts.push('placeholder="' + quoteAttr(placeholder) + '"');
    if (disabled) parts.push("disabled=true");
    return "{{ uif.select(" + parts.join(", ") + ") }}";
  }

  function wcSelect(state) {
    var p = state.props;
    var placeholder = p.placeholder || "Choose an option";
    var disabled = state.meta.state === "disabled";
    var useOptgroups = p.optgroups === true || p.optgroups === "true";
    var attrs = ['placeholder="' + quoteAttr(placeholder) + '"'];
    if (disabled) attrs.push("disabled");
    var options = "";
    if (useOptgroups) {
      options = '\n  <optgroup label="Fruits">\n    <option value="apple">Apple</option>\n    <option value="banana">Banana</option>\n  </optgroup>\n  <optgroup label="Vegetables">\n    <option value="carrot">Carrot</option>\n  </optgroup>\n';
    } else {
      options = '\n  <option value="opt1">Option 1</option>\n  <option value="opt2">Option 2</option>\n  <option value="opt3">Option 3</option>\n';
    }
    return "<uif-select " + attrs.join(" ") + ">" + options + "</uif-select>";
  }

  function njkForm(state) {
    var p = state.props;
    var borderless = p.borderless === true || p.borderless === "true";
    var labelPosition = p.labelPosition || "top";
    var invalid = p.invalid === true || p.invalid === "true";
    var actionsAlign = p.actionsAlign || "end";
    var lines = [];
    lines.push("{% call uif.form(" + (borderless ? "borderless=true" : "") + ") %}");
    lines.push("  {% call uif.formField(" + (invalid ? "invalid=true" : "") + (labelPosition === "side" ? 'labelPosition="side"' : "") + ") %}");
    lines.push('    {{ uif.fieldLabel("Email", htmlFor="email", required=true) }}');
    lines.push('    {{ uif.input(type="email", id="email", placeholder="you@example.com") }}');
    if (invalid) lines.push('    {{ uif.formHelper("Please enter a valid email address.") }}');
    lines.push("  {% endcall %}");
    lines.push("  {% call uif.formField() %}");
    lines.push('    {{ uif.fieldLabel("Password", htmlFor="pw") }}');
    lines.push('    {{ uif.input(type="password", id="pw") }}');
    lines.push("  {% endcall %}");
    lines.push('  {% call uif.formActions(' + (actionsAlign !== "end" ? 'align="' + actionsAlign + '"' : "") + ') %}');
    lines.push('    {{ uif.button("Sign in", variant="solid", type="submit") }}');
    lines.push("  {% endcall %}");
    lines.push("{% endcall %}");
    return lines.join("\n");
  }

  function wcForm(state) {
    var p = state.props;
    var borderless = p.borderless === true || p.borderless === "true";
    var labelPosition = p.labelPosition || "top";
    var invalid = p.invalid === true || p.invalid === "true";
    var actionsAlign = p.actionsAlign || "end";
    var lines = [];
    lines.push("<uif-form" + (borderless ? " borderless" : "") + ">");
    lines.push("  <uif-form-field" + (invalid ? " invalid" : "") + (labelPosition === "side" ? ' label-position="side"' : "") + ">");
    lines.push('    <uif-field-label for="email" required>Email</uif-field-label>');
    lines.push('    <uif-input type="email" id="email" placeholder="you@example.com"></uif-input>');
    if (invalid) lines.push("    <uif-form-helper>Please enter a valid email address.</uif-form-helper>");
    lines.push("  </uif-form-field>");
    lines.push("  <uif-form-field>");
    lines.push('    <uif-field-label for="pw">Password</uif-field-label>');
    lines.push('    <uif-input type="password" id="pw"></uif-input>');
    lines.push("  </uif-form-field>");
    lines.push("  <uif-form-actions" + (actionsAlign !== "end" ? ' align="' + actionsAlign + '"' : "") + ">");
    lines.push('    <uif-button type="submit">Sign in</uif-button>');
    lines.push("  </uif-form-actions>");
    lines.push("</uif-form>");
    return lines.join("\n");
  }

  function njkCalendar(state) {
    var p = state.props;
    var parts = [];
    if (p.month && p.month !== "2026-07") parts.push('month="' + quoteAttr(p.month) + '"');
    if (p.selectedDate) parts.push('selectedDate="' + quoteAttr(p.selectedDate) + '"');
    if (p.rangeStart) parts.push('rangeStart="' + quoteAttr(p.rangeStart) + '"');
    if (p.rangeEnd) parts.push('rangeEnd="' + quoteAttr(p.rangeEnd) + '"');
    if (p.todayDate && p.todayDate !== "1") parts.push('todayDate="' + quoteAttr(p.todayDate) + '"');
    if (state.meta.state && state.meta.state !== "default") parts.push('state="' + quoteAttr(state.meta.state) + '"');
    if (p.disabled === true) parts.push("disabled=true");
    if (p.container === false) parts.push("container=false");
    return "{{ uif.calendar(" + parts.join(", ") + ") }}";
  }


  function njkDialog(state) {
    var p = state.props;
    var title = p.title || "Confirm action";
    var description = p.description || "Review the information before continuing.";
    var dismissible =
      p.dismissible === undefined
        ? true
        : p.dismissible === true || p.dismissible === "true";
    var open =
      p.open === undefined ? true : p.open === true || p.open === "true";
    var confirmLabel = p.confirmLabel || "Confirm";
    var cancelLabel = p.cancelLabel || "Cancel";
    return (
      '{% call uif.dialog(title="' +
      quoteAttr(title) +
      '", description="' +
      quoteAttr(description) +
      '", dismissible=' +
      (dismissible ? "true" : "false") +
      ", open=" +
      (open ? "true" : "false") +
      ', confirmLabel="' +
      quoteAttr(confirmLabel) +
      '", cancelLabel="' +
      quoteAttr(cancelLabel) +
      '") %}Dialog content{% endcall %}'
    );
  }

  function wcDialog(state) {
    var p = state.props;
    var title = p.title || "Confirm action";
    var description = p.description || "Review the information before continuing.";
    var dismissible =
      p.dismissible === undefined
        ? true
        : p.dismissible === true || p.dismissible === "true";
    var open =
      p.open === undefined ? true : p.open === true || p.open === "true";
    var confirmLabel = p.confirmLabel || "Confirm";
    var cancelLabel = p.cancelLabel || "Cancel";
    var attrs = [
      'title="' + quoteAttr(title) + '"',
      'description="' + quoteAttr(description) + '"',
      'dismissible="' + (dismissible ? "true" : "false") + '"',
      'confirm-label="' + quoteAttr(confirmLabel) + '"',
      'cancel-label="' + quoteAttr(cancelLabel) + '"',
    ];
    if (open) attrs.push("open");
    return (
      "<uif-dialog " +
      attrs.join(" ") +
      ">\n  <p>Dialog content</p>\n</uif-dialog>"
    );
  }

  function indicatorArgs(state, kind, format) {
    var p = state.props;
    var fields = kind === "meter" ? ["label", "value", "min", "max", "variant", "size", "valueText"]
      : kind === "progress-bar" ? ["value", "variant", "size", "label", "showValue", "indeterminate"]
      : ["variant", "size"];
    var booleanFields = ["showValue", "indeterminate"];
    var numericFields = ["value", "min", "max"];
    var attributes = { valueText: "value-text", showValue: "show-value" };
    var parts = [];
    fields.forEach(function (field) {
      var value = p[field];
      if (value === undefined) return;
      if (format === "njk") {
        if (booleanFields.includes(field)) value = value === true || value === "true";
        else if (numericFields.includes(field) && value !== "" && Number.isFinite(Number(value))) value = Number(value);
        else value = String(value);
        parts.push(field + "=" + JSON.stringify(value));
      } else if (booleanFields.includes(field)) {
        if (value === true || value === "true") parts.push(attributes[field] || field);
      } else parts.push((attributes[field] || field) + '="' + quoteAttr(String(value)) + '"');
    });
    var scale = ["small", "medium", "large"].includes(p.scale) ? p.scale : null;
    function withScale(code) {
      return scale ? '<div data-scale="' + scale + '">\n  ' + code + '\n</div>' : code;
    }
    if (format === "njk") {
      if (kind === "status-light") parts.unshift("text=" + JSON.stringify(String(state.children === undefined ? "Status" : state.children)));
      var macro = { "status-light": "statusLight", "meter": "meter", "progress-bar": "progressBar" }[kind];
      return withScale("{{ uif." + macro + "(" + parts.join(", ") + ") }}");
    }
    var text = kind === "status-light" ? quoteAttr(String(state.children === undefined ? "Status" : state.children)) : "";
    return withScale("<uif-" + kind + (parts.length ? " " + parts.join(" ") : "") + ">" + text + "</uif-" + kind + ">");
  }

  function tabsCode(state, format) {
    var p = state.props;
    var count = Number(p.tabs || 3);
    var active = Math.min(Number(p.active || 0), count - 1);
    var scale = ["small", "medium", "large"].includes(p.scale) ? p.scale : "medium";
    var orientation = p.orientation === "vertical" ? "vertical" : "horizontal";
    var lines = ['<div data-scale="' + scale + '">'];
    lines.push(format === "njk" ? '{% call uif.tabList(orientation="' + orientation + '", ariaLabel="Tabs") %}' : '<uif-tab-list orientation="' + orientation + '" aria-label="Tabs">');
    for (var i = 0; i < count; i++) {
      lines.push(format === "njk" ? '{{ uif.tab(label="Tab ' + (i + 1) + '", selected=' + (i === active) + ', controls="p' + i + '") }}' : '<uif-tab label="Tab ' + (i + 1) + '" controls="p' + i + '"' + (i === active ? ' selected' : '') + '></uif-tab>');
    }
    lines.push(format === "njk" ? '{% endcall %}' : '</uif-tab-list>');
    for (var j = 0; j < count; j++) {
      lines.push(format === "njk" ? '{% call uif.tabPanel(id="p' + j + '", hidden=' + (j !== active) + ') %}Panel ' + (j + 1) + '{% endcall %}' : '<uif-tab-panel id="p' + j + '"' + (j !== active ? ' hidden' : '') + '>Panel ' + (j + 1) + '</uif-tab-panel>');
    }
    lines.push('</div>');
    return lines.join("\n");
  }

  function withContainerScale(code, props) {
    var scale = ["small", "medium", "large"].includes(props.scale) ? props.scale : null;
    return scale ? '<div data-scale="' + scale + '">\n  ' + code + '\n</div>' : code;
  }

  function messageArgs(state, kind, format) {
    var p = state.props;
    var fields = kind === "inline-alert"
      ? ["title", "description", "variant", "icon", "size", "dismissible", "actionLabel", "actionHref"]
      : ["preset", "heading", "description", "illustrationIcon", "actionLabel", "actionHref", "actionVariant", "size"];
    var booleanFields = ["dismissible"];
    var attributes = {
      actionLabel: "action-label",
      actionHref: "action-href",
      illustrationIcon: "illustration-icon",
      actionVariant: "action-variant",
    };
    var parts = [];
    fields.forEach(function (field) {
      var value = p[field];
      if (field === "actionHref" && value && !/^(?:https?:|mailto:|tel:|\/|#)/.test(String(value))) value = "#";
      if (value === undefined || value === "" || value === false) return;
      if (format === "njk") {
        parts.push(field + "=" + (booleanFields.includes(field) ? "true" : JSON.stringify(String(value))));
      } else if (booleanFields.includes(field)) {
        if (value === true || value === "true") parts.push(attributes[field] || field);
      } else {
        parts.push((attributes[field] || field) + '="' + quoteAttr(String(value)) + '"');
      }
    });
    if (format === "njk") {
      var macro = kind === "inline-alert" ? "inlineAlert" : "illustratedMessage";
      return withContainerScale("{{ uif." + macro + "(" + parts.join(", ") + ") }}", p);
    }
    return withContainerScale("<uif-" + kind + (parts.length ? " " + parts.join(" ") : "") + "></uif-" + kind + ">", p);
  }

  function toastCode(state, format) {
    var p = state.props;
    var message = String(p.message || "Your booking was saved.");
    var variant = ["info", "success", "warning", "error"].includes(p.variant) ? p.variant : "info";
    var duration = p.duration === undefined || p.duration === "" ? 0 : Number(p.duration);
    if (!Number.isFinite(duration) || duration < 0) duration = 0;
    var urgency = ["polite", "assertive"].includes(p.urgency) ? p.urgency : "";
    var actionLabel = String(p.actionLabel || "");
    var position = ["top-start", "top-end", "bottom-start", "bottom-end"].includes(p.position) ? p.position : "top-end";
    if (format === "njk") {
      var args = ["message=" + JSON.stringify(message), "variant=" + JSON.stringify(variant), "duration=" + duration];
      if (urgency) args.push("urgency=" + JSON.stringify(urgency));
      if (actionLabel) args.push("actionLabel=" + JSON.stringify(actionLabel));
      return "{% call uif.toastRegion(label=\"Notifications\", position=" + JSON.stringify(position) + ") %}{{ uif.toast(" + args.join(", ") + ") }}{% endcall %}";
    }
    var attrs = [
      'variant="' + quoteAttr(variant) + '"',
      'message="' + quoteAttr(message) + '"',
      'duration="' + duration + '"',
    ];
    if (urgency) attrs.push('urgency="' + quoteAttr(urgency) + '"');
    if (actionLabel) attrs.push('action-label="' + quoteAttr(actionLabel) + '"');
    return '<uif-toast-region label="Notifications" position="' + quoteAttr(position) + '">\n  <uif-toast ' + attrs.join(" ") + '></uif-toast>\n</uif-toast-region>';
  }

  function popoverCode(state, format) {
    var p = state.props;
    var triggerLabel = String(p.triggerLabel || "Show booking details");
    var label = String(p.label || "Booking details");
    var content = String(p.content || "Your fare can be changed before departure.");
    var placement = ["top", "bottom", "left", "right"].includes(p.placement) ? p.placement : "bottom";
    if (format === "njk") {
      return '{% call uif.popover(triggerId="popover-example-trigger", triggerLabel=' + JSON.stringify(triggerLabel) + ', label=' + JSON.stringify(label) + ', placement=' + JSON.stringify(placement) + ') %}<p>' + quoteAttr(content) + '</p><a href="#fare-conditions">Review fare conditions</a>{% endcall %}';
    }
    return '<button id="popover-example-trigger" type="button" aria-haspopup="dialog" aria-controls="popover-example" aria-expanded="false">' + quoteAttr(triggerLabel) + '</button>\n<uif-popover trigger="popover-example-trigger" label="' + quoteAttr(label) + '" placement="' + quoteAttr(placement) + '">\n  <p>' + quoteAttr(content) + '</p>\n  <a href="#fare-conditions">Review fare conditions</a>\n</uif-popover>';
  }

  function contentPrimitiveCode(state, kind, format) {
    var p = state.props;
    if (kind === "breadcrumbs") {
      if (format === "njk") return '{{ uif.breadcrumbs(items=[{label: "Home", href: "/"}, {label: "Holidays", href: "/holidays"}, {label: "Spain", href: "/spain"}, {label: "Mallorca", href: "/mallorca"}, {label: "Booking", current: true}], label=' + JSON.stringify(String(p.label || "Breadcrumb")) + ', separator=' + JSON.stringify(String(p.separator || "/")) + ', collapseAt=' + Number(p.collapseAt || 4) + ') }}';
      return '<uif-breadcrumbs label="' + quoteAttr(String(p.label || "Breadcrumb")) + '" separator="' + quoteAttr(String(p.separator || "/")) + '" collapse-at="' + Number(p.collapseAt || 4) + '">\n  <a href="/">Home</a>\n  <a href="/holidays">Holidays</a>\n  <a href="/spain">Spain</a>\n  <a href="/mallorca">Mallorca</a>\n  <span aria-current="page">Booking</span>\n</uif-breadcrumbs>';
    }
    if (kind === "card") {
      var title = String(p.title || "Mallorca escape");
      var layout = p.layout === "horizontal" ? "horizontal" : "vertical";
      var selectable = p.selectable === true || p.selectable === "true";
      var selected = p.selected === true || p.selected === "true";
      if (format === "njk") return '{% call uif.card(id="card-example", title=' + JSON.stringify(title) + ', layout=' + JSON.stringify(layout) + (selectable ? ', selectable=true, selected=' + selected : ', href="#mallorca"') + ') %}<p>Seven nights with breakfast and direct flights.</p>{% endcall %}';
      return '<uif-card title="' + quoteAttr(title) + '" layout="' + layout + '"' + (selectable ? ' selectable' + (selected ? ' selected' : '') : ' href="#mallorca"') + '>\n  <p slot="body">Seven nights with breakfast and direct flights.</p>\n  <strong slot="footer">From €499</strong>\n</uif-card>';
    }
    if (kind === "tag") {
      var label = String(p.label || "Family");
      var size = p.size === "sm" ? "sm" : "md";
      var removable = p.removable === true || p.removable === "true";
      if (format === "njk") return '{% call uif.tagGroup(label="Selected filters") %}{{ uif.tag(label=' + JSON.stringify(label) + ', size="' + size + '", removable=' + removable + ') }}{{ uif.tag(label="Beach", size="' + size + '", removable=' + removable + ') }}{% endcall %}';
      return '<uif-tag-group label="Selected filters">\n  <uif-tag label="' + quoteAttr(label) + '" size="' + size + '"' + (removable ? ' removable' : '') + '></uif-tag>\n  <uif-tag label="Beach" size="' + size + '"' + (removable ? ' removable' : '') + '></uif-tag>\n</uif-tag-group>';
    }
    var shape = ["text", "circle", "rectangle"].includes(p.shape) ? p.shape : "text";
    var lines = Math.max(1, Number(p.lines || 3));
    if (format === "njk") return '<section aria-busy="true" aria-label="Loading holiday details">{{ uif.skeleton(shape="' + shape + '", lines=' + lines + ') }}</section>';
    return '<section aria-busy="true" aria-label="Loading holiday details">\n  <uif-skeleton shape="' + shape + '" lines="' + lines + '"></uif-skeleton>\n</section>';
  }

  function inputControlCode(state, kind, format) {
    var p = state.props;
    var macro = {
      "search-field": "searchField",
      "number-field": "numberField",
      "segmented-control": "segmentedControl",
      "range-slider": "rangeSlider",
    }[kind];
    var fields = {
      "search-field": ["label", "name", "value", "placeholder", "disabled", "quiet"],
      "number-field": ["label", "name", "value", "min", "max", "step", "disabled", "readonly", "invalid", "error", "format", "currency", "locale"],
      "segmented-control": ["label", "name", "value", "size", "disabled"],
      "range-slider": ["label", "min", "max", "step", "lower", "upper", "minLabel", "maxLabel", "disabled", "invalid", "error"],
    }[kind];
    var booleans = ["disabled", "readonly", "invalid", "quiet"];
    var numbers = ["value", "min", "max", "step", "lower", "upper"];
    var attributes = { minLabel: "min-label", maxLabel: "max-label" };
    var parts = [];
    if (format === "njk" && kind !== "segmented-control") parts.push('id="' + kind + '-example"');
    if (format === "njk" && kind === "segmented-control" && !String(p.name || "").trim()) {
      parts.push('name="segmented-control-example"');
    }
    fields.forEach(function (field) {
      var value = p[field];
      if (value === undefined || value === "" || value === false) return;
      if (format === "njk") {
        if (booleans.includes(field)) {
          if (value === true || value === "true") parts.push(field + "=true");
        }
        else if (numbers.includes(field) && Number.isFinite(Number(value))) parts.push(field + "=" + Number(value));
        else parts.push(field + "=" + JSON.stringify(String(value)));
      } else if (booleans.includes(field)) {
        if (value === true || value === "true") parts.push(attributes[field] || field);
      } else {
        parts.push((attributes[field] || field) + '="' + quoteAttr(String(value)) + '"');
      }
    });
    if (kind === "segmented-control") {
      if (format === "njk") {
        parts.push('options=[{value: "list", label: "List", icon: "list"}, {value: "grid", label: "Grid", icon: "view"}, {value: "map", label: "Map", icon: "location"}]');
        return "{{ uif." + macro + "(" + parts.join(", ") + ") }}";
      }
      return "<uif-segmented-control" + (parts.length ? " " + parts.join(" ") : "") + ">\n  <span data-value=\"list\" data-label=\"List\" data-icon=\"list\"></span>\n  <span data-value=\"grid\" data-label=\"Grid\" data-icon=\"view\"></span>\n  <span data-value=\"map\" data-label=\"Map\" data-icon=\"location\"></span>\n</uif-segmented-control>";
    }
    if (format === "njk") return "{{ uif." + macro + "(" + parts.join(", ") + ") }}";
    return "<uif-" + kind + (parts.length ? " " + parts.join(" ") : "") + "></uif-" + kind + ">";
  }

  function dropZoneCode(state, format) {
    var p = state.props;
    var attributes = [];
    var label = String(p.label || "Travel documents");
    var description = String(p.description || "PDF or image files");
    var accept = String(p.accept || ".pdf,image/*");
    if (format === "njk") {
      attributes.push('id="drop-zone-example"');
      attributes.push("label=" + JSON.stringify(label));
      attributes.push("description=" + JSON.stringify(description));
      attributes.push('name="documents"');
      attributes.push("accept=" + JSON.stringify(accept));
      ["multiple", "loading", "disabled", "invalid"].forEach(function (name) {
        if (p[name] === true || p[name] === "true") attributes.push(name + "=true");
      });
      if (p.error) attributes.push("error=" + JSON.stringify(String(p.error)));
      return "{{ uif.dropZone(" + attributes.join(", ") + ") }}";
    }
    attributes.push('label="' + quoteAttr(label) + '"');
    attributes.push('description="' + quoteAttr(description) + '"');
    attributes.push('name="documents"');
    attributes.push('accept="' + quoteAttr(accept) + '"');
    ["multiple", "loading", "disabled", "invalid"].forEach(function (name) {
      if (p[name] === true || p[name] === "true") attributes.push(name);
    });
    if (p.error) attributes.push('error="' + quoteAttr(String(p.error)) + '"');
    return "<uif-drop-zone " + attributes.join(" ") + "></uif-drop-zone>";
  }

  function treeViewCode(state, format) {
    var p = state.props;
    var label = String(p.label || "Destinations");
    var selection = ["single", "multiple", "none"].includes(p.selection) ? p.selection : "multiple";
    var reorderable = p.reorderable === true || p.reorderable === "true";
    var lazy = p.lazy === true || p.lazy === "true";
    if (format === "njk") {
      var items = '[{value: "europe", label: "Europe", expanded: true, children: [{value: "spain", label: "Spain"}, {value: "greece", label: "Greece"}]}, {value: "americas", label: "Americas", children: [{value: "mexico", label: "Mexico"}, {value: "canada", label: "Canada"}]}' + (lazy ? ', {value: "islands", label: "Islands", lazy: true}' : "") + "]";
      return "{{ uif.treeView(id=\"tree-view-example\", label=" + JSON.stringify(label) + ", selection=\"" + selection + "\", reorderable=" + (reorderable ? "true" : "false") + ", items=" + items + ") }}";
    }
    return '<uif-tree-view label="' + quoteAttr(label) + '" selection="' + selection + '"' + (reorderable ? " reorderable" : "") + '>\n' +
      '  <uif-tree-item value="europe" label="Europe" expanded>\n    <uif-tree-item value="spain" label="Spain"></uif-tree-item>\n    <uif-tree-item value="greece" label="Greece"></uif-tree-item>\n  </uif-tree-item>\n' +
      '  <uif-tree-item value="americas" label="Americas">\n    <uif-tree-item value="mexico" label="Mexico"></uif-tree-item>\n    <uif-tree-item value="canada" label="Canada"></uif-tree-item>\n  </uif-tree-item>' +
      (lazy ? '\n  <uif-tree-item value="islands" label="Islands" lazy></uif-tree-item>' : "") +
      "\n</uif-tree-view>";
  }

  function colorPickerCode(state, format) {
    var p = state.props;
    var attributes = [];
    var label = String(p.label || "Brand color");
    var value = String(p.value || "#0066CC");
    if (format === "njk") {
      attributes.push('id="color-picker-example"');
      attributes.push("label=" + JSON.stringify(label));
      attributes.push('name="brandColor"');
      attributes.push("value=" + JSON.stringify(value));
      ["readonly", "disabled", "invalid"].forEach(function (name) {
        if (p[name] === true || p[name] === "true") attributes.push(name + "=true");
      });
      if (p.error) attributes.push("error=" + JSON.stringify(String(p.error)));
      return "{{ uif.colorPicker(" + attributes.join(", ") + ") }}";
    }
    attributes.push('label="' + quoteAttr(label) + '"');
    attributes.push('name="brandColor"');
    attributes.push('value="' + quoteAttr(value) + '"');
    ["readonly", "disabled", "invalid"].forEach(function (name) {
      if (p[name] === true || p[name] === "true") attributes.push(name);
    });
    if (p.error) attributes.push('error="' + quoteAttr(String(p.error)) + '"');
    return "<uif-color-picker " + attributes.join(" ") + "></uif-color-picker>";
  }

  function comboBoxCode(state, format) {
    var p = state.props;
    var attributes = [];
    var label = String(p.label || "Destination");
    var placeholder = String(p.placeholder || "Search destinations");
    if (format === "njk") {
      attributes.push('id="combo-box-example"');
      attributes.push("label=" + JSON.stringify(label));
      attributes.push('name="destination"');
      attributes.push("placeholder=" + JSON.stringify(placeholder));
      ["freeform", "loading", "readonly", "disabled", "invalid"].forEach(function (name) {
        if (p[name] === true || p[name] === "true") attributes.push(name + "=true");
      });
      if (p.error) attributes.push("error=" + JSON.stringify(String(p.error)));
      attributes.push('options=[{value: "pmi", textValue: "Palma de Mallorca", label: "Palma de Mallorca — PMI"}, {value: "tfs", textValue: "Tenerife", label: "Tenerife — TFS"}, {value: "lpa", textValue: "Gran Canaria", label: "Gran Canaria — LPA"}]');
      return "{{ uif.comboBox(" + attributes.join(", ") + ") }}";
    }
    attributes.push('label="' + quoteAttr(label) + '"');
    attributes.push('name="destination"');
    attributes.push('placeholder="' + quoteAttr(placeholder) + '"');
    ["freeform", "loading", "readonly", "disabled", "invalid"].forEach(function (name) {
      if (p[name] === true || p[name] === "true") attributes.push(name);
    });
    if (p.error) attributes.push('error="' + quoteAttr(String(p.error)) + '"');
    return '<uif-combo-box ' + attributes.join(" ") + '>\n  <uif-combo-box-option value="pmi" text-value="Palma de Mallorca"><strong>Palma de Mallorca — PMI</strong></uif-combo-box-option>\n  <uif-combo-box-option value="tfs" text-value="Tenerife"><strong>Tenerife — TFS</strong></uif-combo-box-option>\n  <uif-combo-box-option value="lpa" text-value="Gran Canaria"><strong>Gran Canaria — LPA</strong></uif-combo-box-option>\n</uif-combo-box>';
  }

  global.UIPlaygroundCodeGenerators = {
    njk: {
      "status-light": function (state) { return indicatorArgs(state, "status-light", "njk"); },
      "meter": function (state) { return indicatorArgs(state, "meter", "njk"); },
      "progress-bar": function (state) { return indicatorArgs(state, "progress-bar", "njk"); },
      "inline-alert": function (state) { return messageArgs(state, "inline-alert", "njk"); },
      "illustrated-message": function (state) { return messageArgs(state, "illustrated-message", "njk"); },
      "toast": function (state) { return withContainerScale(toastCode(state, "njk"), state.props); },
      "popover": function (state) { return withContainerScale(popoverCode(state, "njk"), state.props); },
      "breadcrumbs": function (state) { return withContainerScale(contentPrimitiveCode(state, "breadcrumbs", "njk"), state.props); },
      "card": function (state) { return withContainerScale(contentPrimitiveCode(state, "card", "njk"), state.props); },
      "tag": function (state) { return withContainerScale(contentPrimitiveCode(state, "tag", "njk"), state.props); },
      "skeleton": function (state) { return withContainerScale(contentPrimitiveCode(state, "skeleton", "njk"), state.props); },
      "search-field": function (state) { return withContainerScale(inputControlCode(state, "search-field", "njk"), state.props); },
      "number-field": function (state) { return withContainerScale(inputControlCode(state, "number-field", "njk"), state.props); },
      "segmented-control": function (state) { return withContainerScale(inputControlCode(state, "segmented-control", "njk"), state.props); },
      "range-slider": function (state) { return withContainerScale(inputControlCode(state, "range-slider", "njk"), state.props); },
      "combo-box": function (state) { return withContainerScale(comboBoxCode(state, "njk"), state.props); },
      "color-picker": function (state) { return withContainerScale(colorPickerCode(state, "njk"), state.props); },
      "drop-zone": function (state) { return dropZoneCode(state, "njk"); },
      "tree-view": function (state) { return treeViewCode(state, "njk"); },

      dialog: njkDialog,
      button: njkButton, input: njkInput, checkbox: njkCheckbox,
      "switch": njkSwitch, icon: njkIcon, radio: njkRadio, badge: njkBadge,
      label: function () { return '{{ uif.labelContent("text", "icon") }}'; },
      "button-group": function () { return '{% call uif.buttonGroup() %}...{% endcall %}'; },
      select: njkSelect,
      form: njkForm,
      calendar: njkCalendar,
      divider: function (state) {
        var p = state.props;
        var parts = [];
        if (p.orientation === "vertical") parts.push('orientation="vertical"');
        if (p.variant) parts.push('variant="' + p.variant + '"');
        return "{{ uif.divider(" + parts.join(", ") + ") }}";
      },
      link: function (state) {
        var p = state.props;
        var text = state.children || "Link text";
        var parts = ['"' + quoteAttr(text) + '"'];
        if (p.href && p.href !== "#") parts.push('href="' + quoteAttr(p.href) + '"');
        if (p.startIcon) parts.push('startIcon="' + quoteAttr(p.startIcon) + '"');
        if (p.endIcon) parts.push('endIcon="' + quoteAttr(p.endIcon) + '"');
        return "{{ uif.link(" + parts.join(", ") + ") }}";
      },
      textarea: function (state) {
        var p = state.props;
        var parts = [];
        if (p.placeholder) parts.push('placeholder="' + quoteAttr(p.placeholder) + '"');
        if (p.rows) parts.push('rows="' + p.rows + '"');
        if (state.meta.state === "disabled") parts.push("disabled=true");
        return "{{ uif.textarea(" + parts.join(", ") + ") }}";
      },
      avatar: function (state) {
        var p = state.props;
        var parts = [];
        if (p.src) parts.push('src="' + quoteAttr(p.src) + '"');
        if (p.initials) parts.push('initials="' + quoteAttr(p.initials) + '"');
        if (p.size && p.size !== "md") parts.push('size="' + p.size + '"');
        return "{{ uif.avatar(" + parts.join(", ") + ") }}";
      },
      accordion: function () {
        return '{% call uif.accordion() %}\n  {% call uif.accordionItem("Section 1", open=true) %}Content{% endcall %}\n  {% call uif.accordionItem("Section 2") %}Content{% endcall %}\n{% endcall %}';
      },
      tabs: function (state) { return tabsCode(state, "njk"); },
      tooltip: function (state) {
        var p = state.props;
        var text = p.text || "Tooltip text";
        var placement = p.placement || "top";
        var showDelay = p.showDelay || "300";
        var hideDelay = p.hideDelay || "0";
        return '{% call uif.tooltip("' + quoteAttr(text) + '", placement="' + placement + '", showDelay=' + showDelay + ', hideDelay=' + hideDelay + ') %}<button class="uif-button">Hover me</button>{% endcall %}';
      },
      table: function (state) {
        var p = state.props;
        var density = p.density && p.density !== "default" ? ', density="' + p.density + '"' : "";
        var selection = p.selection && p.selection !== "none" ? ', selection="' + p.selection + '"' : "";
        var sortable = p.sortable ? ", sortable=true" : "";
        var resizable = p.resizable ? ", resizable=true" : "";
        return '{% call uif.table(caption="Destinations"' + density + selection + sortable + resizable + ') %}\n  {% call uif.tableHead() %}\n    {{ uif.th("Destination") }}\n    {{ uif.th("Departure") }}\n    {{ uif.th("Duration") }}\n    {{ uif.th("Price") }}\n  {% endcall %}\n  {% call uif.tableBody() %}\n    {{ uif.tr(["Mallorca", "15 Aug 2025", "7 nights", "€499"]) }}\n    {{ uif.tr(["Tenerife", "22 Aug 2025", "14 nights", "€799"]) }}\n  {% endcall %}\n{% endcall %}';
      },
    },
    wc: {
      "status-light": function (state) { return indicatorArgs(state, "status-light", "wc"); },
      "meter": function (state) { return indicatorArgs(state, "meter", "wc"); },
      "progress-bar": function (state) { return indicatorArgs(state, "progress-bar", "wc"); },
      "inline-alert": function (state) { return messageArgs(state, "inline-alert", "wc"); },
      "illustrated-message": function (state) { return messageArgs(state, "illustrated-message", "wc"); },
      "toast": function (state) { return withContainerScale(toastCode(state, "wc"), state.props); },
      "popover": function (state) { return withContainerScale(popoverCode(state, "wc"), state.props); },
      "breadcrumbs": function (state) { return withContainerScale(contentPrimitiveCode(state, "breadcrumbs", "wc"), state.props); },
      "card": function (state) { return withContainerScale(contentPrimitiveCode(state, "card", "wc"), state.props); },
      "tag": function (state) { return withContainerScale(contentPrimitiveCode(state, "tag", "wc"), state.props); },
      "skeleton": function (state) { return withContainerScale(contentPrimitiveCode(state, "skeleton", "wc"), state.props); },
      "search-field": function (state) { return withContainerScale(inputControlCode(state, "search-field", "wc"), state.props); },
      "number-field": function (state) { return withContainerScale(inputControlCode(state, "number-field", "wc"), state.props); },
      "segmented-control": function (state) { return withContainerScale(inputControlCode(state, "segmented-control", "wc"), state.props); },
      "range-slider": function (state) { return withContainerScale(inputControlCode(state, "range-slider", "wc"), state.props); },
      "combo-box": function (state) { return withContainerScale(comboBoxCode(state, "wc"), state.props); },
      "color-picker": function (state) { return withContainerScale(colorPickerCode(state, "wc"), state.props); },
      "drop-zone": function (state) { return dropZoneCode(state, "wc"); },
      "tree-view": function (state) { return treeViewCode(state, "wc"); },

      dialog: wcDialog,
      button: wcButton, input: wcInput, checkbox: wcCheckbox,
      "switch": wcSwitch, icon: wcIcon, radio: wcRadio, badge: wcBadge,
      label: function () { return "<uif-field-label>...</uif-field-label>"; },
      "button-group": function () { return "<uif-button-group>...</uif-button-group>"; },
      select: wcSelect,
      form: wcForm,
      calendar: function () {
        return "<!-- Calendar is provided as Nunjucks/static HTML in this package. -->";
      },
      divider: function (state) {
        var p = state.props;
        var attrs = [];
        if (p.orientation === "vertical") attrs.push('orientation="vertical"');
        if (p.variant) attrs.push('variant="' + p.variant + '"');
        return "<uif-divider" + (attrs.length ? " " + attrs.join(" ") : "") + "></uif-divider>";
      },
      link: function (state) {
        var p = state.props;
        var text = state.children || "Link text";
        var attrs = [];
        if (p.href && p.href !== "#") attrs.push('href="' + quoteAttr(p.href) + '"');
        if (p.startIcon) attrs.push('start-icon="' + quoteAttr(p.startIcon) + '"');
        if (p.endIcon) attrs.push('end-icon="' + quoteAttr(p.endIcon) + '"');
        return "<uif-link" + (attrs.length ? " " + attrs.join(" ") : "") + ">" + quoteAttr(text) + "</uif-link>";
      },
      textarea: function (state) {
        var p = state.props;
        var attrs = [];
        if (p.placeholder) attrs.push('placeholder="' + quoteAttr(p.placeholder) + '"');
        if (p.rows) attrs.push('rows="' + p.rows + '"');
        if (state.meta.state === "disabled") attrs.push("disabled");
        return "<uif-textarea" + (attrs.length ? " " + attrs.join(" ") : "") + "></uif-textarea>";
      },
      avatar: function (state) {
        var p = state.props;
        var attrs = [];
        if (p.src) attrs.push('src="' + quoteAttr(p.src) + '"');
        if (p.initials) attrs.push('initials="' + quoteAttr(p.initials) + '"');
        if (p.size && p.size !== "md") attrs.push('size="' + p.size + '"');
        return "<uif-avatar" + (attrs.length ? " " + attrs.join(" ") : "") + "></uif-avatar>";
      },
      accordion: function () {
        return '<uif-accordion>\n  <uif-accordion-item title="Section 1" open>Content</uif-accordion-item>\n  <uif-accordion-item title="Section 2">Content</uif-accordion-item>\n</uif-accordion>';
      },
      tabs: function (state) { return tabsCode(state, "wc"); },
      tooltip: function (state) {
        var p = state.props;
        var text = p.text || "Tooltip text";
        var placement = p.placement || "top";
        var showDelay = p.showDelay || "300";
        var hideDelay = p.hideDelay || "0";
        return '<uif-tooltip text="' + quoteAttr(text) + '" placement="' + placement + '" show-delay="' + showDelay + '" hide-delay="' + hideDelay + '">\n  <button class="uif-button">Hover me</button>\n</uif-tooltip>';
      },
      table: function () {
        return "<!-- Table is a CSS/JS pattern — no Web Component variant. Use the HTML output directly. -->";
      },
    },
  };
})(window);

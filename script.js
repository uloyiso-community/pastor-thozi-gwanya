(function () {
  var API_URL = 'https://thozi.zo.space/api/christian-code/leads';
  var CONFIG_URL = 'https://thozi.zo.space/api/christian-code/config';

  document.addEventListener('DOMContentLoaded', function () {
    function showStatus(formId, message, isError) {
      var status = document.querySelector('[data-status="' + formId + '"]');
      if (!status) return;
      status.textContent = message;
      status.classList.add('show');
      status.classList.toggle('error', Boolean(isError));
      status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function wireLeadForm(formId, leadType) {
      var form = document.getElementById(formId);
      if (!form) return;
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        var button = form.querySelector('button[type="submit"]');
        if (button) {
          button.disabled = true;
          button.dataset.originalText = button.textContent;
          button.textContent = 'Sending…';
        }
        try {
          var response = await fetch(API_URL, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: buildFormData(form, leadType)
          });
          var result = await response.json().catch(function () { return {}; });
          if (!response.ok) throw new Error(result.error || 'Unable to submit this form.');
          showStatus(formId, result.message || 'Thank you. Your details have been received.', false);
          form.reset();
        } catch (error) {
          showStatus(formId, error.message || 'Unable to submit this form. Please try again.', true);
        } finally {
          if (button) {
            button.disabled = false;
            button.textContent = button.dataset.originalText;
          }
        }
      });
    }

    function buildFormData(form, leadType) {
      var data = new FormData(form);
      data.append('leadType', leadType);
      data.append('sourcePage', window.location.href);
      return data;
    }

    wireLeadForm('sampleForm', 'free-sample');
    wireLeadForm('betaForm', 'founding-beta');
    wireLeadForm('speakingForm', 'speaking-enquiry');
    wireLeadForm('popForm', 'proof-of-payment');
    fetch(CONFIG_URL, { headers: { Accept: 'application/json' } })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (config) {
        if (!config) return;
        var price = document.getElementById('ebookPrice');
        var note = document.getElementById('ebookPriceNote');
        if (price) price.textContent = config.ebookPrice === 249 ? 'R249' : 'R163';
        if (note) note.textContent = config.ebookPrice === 249 ? 'Current price' : 'Rises to R249 after 30 days';
      })
      .catch(function () {});

    var popDrop = document.getElementById('popDrop');
    var popFile = document.getElementById('popFile');
    var popLabel = document.getElementById('popLabel');

    if (popDrop && popFile) {
      popDrop.addEventListener('click', function () { popFile.click(); });
      popDrop.addEventListener('dragover', function (e) {
        e.preventDefault();
        popDrop.style.borderColor = 'var(--gold)';
      });
      popDrop.addEventListener('dragleave', function () { popDrop.style.borderColor = ''; });
      popDrop.addEventListener('drop', function (e) {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
          popFile.files = e.dataTransfer.files;
          updatePopLabel();
        }
      });
      popFile.addEventListener('change', updatePopLabel);
    }

    function updatePopLabel() {
      if (popFile.files && popFile.files[0]) popLabel.textContent = 'Selected: ' + popFile.files[0].name;
    }

    document.querySelectorAll('.faq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var answer = item.querySelector('.faq-a');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('open');
            openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
            openItem.querySelector('.faq-q .icon').textContent = '+';
            openItem.querySelector('.faq-a').style.maxHeight = null;
          }
        });
        if (isOpen) {
          item.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          btn.querySelector('.icon').textContent = '+';
          answer.style.maxHeight = null;
        } else {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          btn.querySelector('.icon').textContent = '−';
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });

    var cookieBanner = document.getElementById('cookieBanner');
    var cookieAccept = document.getElementById('cookieAccept');
    var cookieDecline = document.getElementById('cookieDecline');
    var CONSENT_KEY = 'ccemc_cookie_consent';

    if (cookieBanner && !localStorage.getItem(CONSENT_KEY)) {
      setTimeout(function () { cookieBanner.classList.add('show'); }, 800);
    }
    function setConsent(value) {
      localStorage.setItem(CONSENT_KEY, value);
      cookieBanner.classList.remove('show');
    }
    if (cookieAccept) cookieAccept.addEventListener('click', function () { setConsent('accepted'); });
    if (cookieDecline) cookieDecline.addEventListener('click', function () { setConsent('declined'); });

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  });
})();

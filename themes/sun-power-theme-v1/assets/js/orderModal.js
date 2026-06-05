document.addEventListener('DOMContentLoaded', () => {
  // We don't call lucide.createIcons() here again because it's usually called in main.js
  
  const modal = document.getElementById('orderModal');
  const backdrop = document.getElementById('modalBackdrop');
  const form = document.getElementById('orderForm');
  const fSubmit = document.getElementById('fSubmit');
  const fStatus = document.getElementById('fStatus');
  const success = document.getElementById('orderSuccess');
  const cbBox = document.getElementById('cbBox');
  const cbInput = document.getElementById('cbInput');
  const cbErr = document.getElementById('cbErr');
  
  if (cbInput) {
    cbInput.addEventListener('change', () => {
      if (cbBox) cbBox.classList.toggle('on', cbInput.checked);
      if (cbInput.checked && cbErr) {
        cbErr.classList.add('hidden');
        cbErr.classList.remove('block');
      }
    });
  }

  function openModal(d) {
    if (!form) return;
    form.reset(); 
    clearErrs();
    fStatus.classList.add('hidden');
    success.classList.remove('show');
    cbBox.classList.remove('on'); 
    cbInput.checked = false;
    fSubmit.disabled = false;
    
    if (d != null) {
      fSubmit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Залишити заявку';

      const mpTitle = document.getElementById('mpTitle');
      const mpRequest = document.getElementById('mpRequest');
      if (mpTitle) mpTitle.textContent = d.name;
      if (mpRequest) mpRequest.textContent = d.desc;
    } 
   
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    const hTitle = document.getElementById('h_mpTitle');
    const hRequest = document.getElementById('h_mpRequest');
    const hObj = document.getElementById('h_mpObject');
    const hTask = document.getElementById('h_mpTask');
    const hPower = document.getElementById('h_mpPower');
    
    if (hTitle && document.getElementById('mpTitle')) hTitle.value = document.getElementById('mpTitle').textContent;
    if (hRequest && document.getElementById('mpRequest')) hRequest.value = document.getElementById('mpRequest').textContent;
    if (hObj && document.getElementById('mpObject')) hObj.value = document.getElementById('mpObject').textContent;
    if (hTask && document.getElementById('mpTask')) hTask.value = document.getElementById('mpTask').textContent;
    if (hPower && document.getElementById('mpPower')) hPower.value = document.getElementById('mpPower').textContent;
  }

  function closeModal() {
    if (modal) modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  
  if (modal) {
    const modalClose = modal.querySelector('#modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);
  }
  const successClose = document.getElementById('successClose');
  if (successClose) successClose.addEventListener('click', closeModal);
  
  if (backdrop) backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { 
    if (e.key === 'Escape') closeModal(); 
  });

  function cardData(c) {
    return { 
      name: c.dataset.name || '', 
      cat: c.dataset.category || '',
      img: c.dataset.img || '', 
      desc: c.dataset.desc || '' 
    };
  }
  
  document.querySelectorAll('[data-name]').forEach(card => {
    card.addEventListener('click', () => openModal(cardData(card)));
  });
  
  document.querySelectorAll('.btn-open-modal').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card = null;
      const btnText = btn.textContent.trim();
      const btnTextLower = btnText.toLowerCase();
      const mpGreenBadge = document.getElementById("modal_green-badge");
      const mpSubtitle = document.getElementById("modal_subtitle");
      if (
        btnTextLower.includes("прорахунок") ||
        btnTextLower.includes("розрахунок")
      ) {
        fSubmit.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Отримати розрахунок`;
        if (mpGreenBadge) mpGreenBadge.textContent = "Безкоштовний прорахунок";
        if (mpName) {
          mpName.innerHTML = `Дізнайтеся вартість СЕС <br><span class="bg-gradient-to-br from-amber-500 via-amber-400 to-orange-500 bg-clip-text text-transparent font-medium">для вашого об’єкта</span>`;

        } else {
            mpName.innerHTML = `Залиште заявку —<br><span class="bg-gradient-to-br from-amber-500 via-amber-400 to-orange-500 bg-clip-text text-transparent font-medium">ми відповімо.</span>`;
        }
        if (mpSubtitle) mpSubtitle.textContent =
          "Інженери А100 підберуть обладнання, розрахують потужність і підкажуть оптимальне рішення для вашого об’єкта.";
      } else {
        if (mpGreenBadge) mpGreenBadge.textContent = "Завжди на зв'язку";
        if (mpSubtitle) mpSubtitle.textContent = "Наші фахівці зв'яжуться з вами, щоб відповісти на всі ваші питання та допомогти.";
        if (mpName) {
          mpName.innerHTML = `Залиште заявку —<br><span class="bg-gradient-to-br from-amber-500 via-amber-400 to-orange-500 bg-clip-text text-transparent font-medium">ми відповімо.</span>`;
        }
        fSubmit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Залишити заявку';
      }
      const mpPower = document.getElementById('mpPower');
      const mpObject = document.getElementById('mpObject');
      const mpTask = document.getElementById('mpTask');
      if (mpPower) mpPower.textContent = "";
      if (mpObject) mpObject.textContent = "";
      if (mpTask) mpTask.textContent = "";
      
      const closestBtn = btn.closest('#calcForm');
      if (closestBtn != null) {
        const checkedRadios = document.querySelectorAll('#calcForm input[type="radio"]:checked');
        checkedRadios.forEach(radio => {
          const radioName = radio.name;
          const label = document.querySelector(`label[for="${radio.id}"]`);
          if (!label) return; 
          const selectedText = label.textContent.trim();
          const formattedName = radioName
            .replace(/[-_]([a-z])/g, match => match[1].toUpperCase()) 
            .replace(/^[a-z]/, match => match.toUpperCase());         
          
          const targetId = `mp${formattedName}`;
          const targetElement = document.getElementById(targetId);
         
          if (targetElement) {
            targetElement.textContent = selectedText;
          }
        });
      } 
      openModal(card);
    });
  });

  function clearErrs() {
    if (!form) return;
    form.querySelectorAll('.lm-input').forEach(i => i.classList.remove('err'));
    form.querySelectorAll('.ferr').forEach(p => { 
      p.classList.add('hidden'); 
      p.classList.remove('block'); 
    });
    if (cbErr) {
      cbErr.classList.add('hidden');
      cbErr.classList.remove('block');
    }
  }
  
  function fieldErr(inp, msg) {
    inp.classList.add('err');
    const p = inp.parentElement.querySelector('.ferr');
    if (p) { 
      p.textContent = msg; 
      p.classList.remove('hidden'); 
      p.classList.add('block'); 
    }
  }
  
  function validate() {
    clearErrs(); 
    let ok = true;
    if (!form) return false;
    const nm = form.querySelector('[name="nm"]');
    const ph = form.querySelector('[name="ph"]');

    if (nm && !nm.value.trim()) { 
      fieldErr(nm, "Будь ласка, вкажіть ваше ім'я."); 
      ok = false; 
    }
    if (ph && !ph.value.trim()) { 
      fieldErr(ph, 'Будь ласка, вкажіть телефон.'); 
      ok = false; 
    }
    if (cbInput && !cbInput.checked) { 
      if (cbErr) {
        cbErr.classList.remove('hidden'); 
        cbErr.classList.add('block'); 
      }
      ok = false; 
    }
    return ok;
  }

  function showStatus(type, text) {
    if (!fStatus) return;
    fStatus.classList.remove('hidden', 'bg-red-50', 'text-red-600', 'bg-green-50', 'text-green-600');
    fStatus.classList.add(type === 'error' ? 'bg-red-50' : 'bg-green-50', type === 'error' ? 'text-red-600' : 'text-green-600');
    fStatus.textContent = text;
  }

  function resetSubmitButton() {
    if (!fSubmit) return;
    fSubmit.disabled = false;
    fSubmit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Залишити заявку';
  }

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validate()) return;

      if (fStatus) fStatus.classList.add('hidden');

      if (fSubmit) {
        fSubmit.disabled = true;
        fSubmit.innerHTML = '<svg style="animation:spin 1s linear infinite;width:1rem;height:1rem;" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="32" stroke-dashoffset="12"/></svg>&nbsp;Надсилаємо…';
      }

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          form.reset();
          if (cbBox) cbBox.classList.remove('on');
          if (cbInput) cbInput.checked = false;
          if (success) {
            success.classList.add('show');
            if (typeof lucide !== 'undefined') {
              lucide.createIcons({ nodes: [success] });
            }
          }
        } else {
          showStatus('error', (data && data.message) || 'Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте нам.');
          resetSubmitButton();
        }
      } catch (err) {
        showStatus('error', 'Помилка мережі. Перевірте з’єднання та спробуйте ще раз.');
        resetSubmitButton();
      }
    });
  }
});

function togglePhoneDropdown() {
  const dropdown = document.getElementById('phone-dropdown');
  const chevron = document.getElementById('dropdown-chevron');
  if (!dropdown || !chevron) return;
  
  if (dropdown.classList.contains('hidden')) {
    dropdown.classList.remove('hidden');
    setTimeout(() => {
      dropdown.classList.remove('opacity-0', 'scale-95');
      dropdown.classList.add('opacity-100', 'scale-100');
      chevron.classList.add('rotate-180');
    }, 10);
  } else {
    dropdown.classList.remove('opacity-100', 'scale-100');
    dropdown.classList.add('opacity-0', 'scale-95');
    chevron.classList.remove('rotate-180');
    setTimeout(() => {
      dropdown.classList.add('hidden');
    }, 300);
  }
}

// Make it global so inline onclick can use it
window.togglePhoneDropdown = togglePhoneDropdown;

window.addEventListener('click', function(e) {
  const wrapper = document.getElementById('phone-dropdown-wrapper');
  const dropdown = document.getElementById('phone-dropdown');
  const chevron = document.getElementById('dropdown-chevron');
  if (wrapper && dropdown && chevron && !wrapper.contains(e.target)) {
    dropdown.classList.remove('opacity-100', 'scale-100');
    dropdown.classList.add('opacity-0', 'scale-95');
    chevron.classList.remove('rotate-180');
    setTimeout(() => {
      dropdown.classList.add('hidden');
    }, 300);
  }
});
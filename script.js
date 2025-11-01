function toggleChat() {
  const box = document.getElementById('chatbot');
  box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const body = document.getElementById('chat-body');
  const text = input.value.trim();
  if (!text) return;

  const userDiv = document.createElement('div');
  userDiv.className = 'msg user';
  userDiv.textContent = text;
  body.appendChild(userDiv);

  let reply = "I am available 24/7 to answer about DhofarCare.";
  const q = text.toLowerCase();
  if (q.includes('service')) {
    reply = "We provide: cleaning, AC maintenance, plumbing, electrical, painting & décor, CCTV/smart home, car wash, gardening, ladies salon, moving – in Dhofar only.";
  } else if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
    reply = "Prices start from 5 OMR for simple jobs and 15–25 OMR for AC / plumbing / electrical. Final price depends on area & technician.";
  } else if (q.includes('area') || q.includes('where') || q.includes('dhofar')) {
    reply = "We cover: Salalah, Taqah, Mirbat, Thumrait, Rakhyut, Dhalkut and nearby areas in Dhofar.";
  } else if (q.includes('24')) {
    reply = "Yes, requests are accepted 24/7. Technicians are assigned according to schedule.";
  } else if (q.includes('book')) {
    reply = "To book, fill the form at the bottom with your name, email, phone, Dhofar area, service type, and date/time.";
  }
  const botDiv = document.createElement('div');
  botDiv.className = 'msg bot';
  botDiv.textContent = reply;
  body.appendChild(botDiv);

  body.scrollTop = body.scrollHeight;
  input.value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.createdAt = new Date().toISOString();

    // 1) pretend save to cloud
    if (typeof saveToFirebase === 'function') {
      try { await saveToFirebase(data); } catch (err) { console.warn('cloud fail', err); }
    }

    // 2) send to admin
    try {
      await emailjs.send("service_dhofarcare", "template_booking", {
        to_email: "sharooqalmashani1@gmail.com",
        user_name: data.name,
        user_email: data.email,
        user_phone: data.phone,
        user_area: data.area,
        user_service: data.service,
        user_datetime: data.datetime,
        user_notes: data.notes || ""
      });
    } catch (err) {
      console.warn('admin email fail', err);
    }

    // 3) auto-reply to customer
    try {
      await emailjs.send("service_dhofarcare", "template_autoreply", {
        customer_email: data.email,
        customer_name: data.name || "Customer",
        service_name: data.service || "Home Service",
        dhofar_area: data.area || "Dhofar",
        request_time: data.datetime || ""
      });
    } catch (err) {
      console.warn('customer email fail', err);
    }

    alert("Request submitted. You will receive an email shortly.");
    form.reset();
  });
});

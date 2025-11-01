// toggle chatbot
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

  let reply = "I'm here 24/7. Ask me about services, prices, Dhofar coverage, or booking.";
  const lower = text.toLowerCase();

  if (lower.includes('service')) {
    reply = "Available services: home cleaning, AC maintenance, plumbing, electrical, painting & décor, CCTV/smart home, car wash, gardening, ladies home salon. All in Dhofar.";
  } else if (lower.includes('price') || lower.includes('how much') || lower.includes('cost')) {
    reply = "Prices start from 5 OMR for small jobs and 15–25 OMR for AC/electrical/plumbing. Final price depends on your Dhofar area and technician availability.";
  } else if (lower.includes('area') || lower.includes('where') || lower.includes('dhofar')) {
    reply = "We currently serve Dhofar only: Salalah, Taqah, Mirbat, Thumrait, Rakhyut, Dhalkut and nearby areas.";
  } else if (lower.includes('24')) {
    reply = "Yes, we receive requests 24/7. Technicians are dispatched during working hours or as agreed.";
  } else if (lower.includes('book') || lower.includes('register')) {
    reply = "To book: fill the form with name, phone, Dhofar area, service type, and time. Admin will confirm and assign a technician.";
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

    // 1) save to firebase/cloud (placeholder)
    if (typeof saveToFirebase === 'function') {
      try { await saveToFirebase(data); } catch (err) { console.warn('firebase save failed', err); }
    }

    // 2) send to admin
    let adminOk = false;
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
      adminOk = true;
    } catch (err) {
      console.warn("Admin email failed", err);
    }

    // 3) auto-reply to customer (English)
    try {
      await emailjs.send("service_dhofarcare", "template_autoreply", {
        customer_email: data.email,
        customer_name: data.name || "Customer",
        service_name: data.service || "Home Service",
        dhofar_area: data.area || "Dhofar",
        request_time: data.datetime || ""
      });
    } catch (err) {
      console.warn("Customer auto-reply failed", err);
    }

    if (adminOk) {
      alert("✅ Request submitted.
An email was sent to you (admin) and to the customer.");
    } else {
      alert("Request submitted locally. Configure EmailJS IDs to receive emails.");
    }

    form.reset();
  });
});

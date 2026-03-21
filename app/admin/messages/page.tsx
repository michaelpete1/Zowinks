"use client";

import { useMemo, useState } from "react";
import { AdminBadge, AdminIcon, AdminShell } from "../../../components/AdminShell";

type ContactMessage = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  priority: "High" | "Medium" | "Low";
};

const initialMessages: ContactMessage[] = [
  { id: "MSG-301", name: "Amina Yusuf", company: "Meridian Health", email: "amina@meridianhealth.ng", phone: "+234 801 555 9012", message: "We need 18 laptops for our finance team and want delivery options for next week.", priority: "High" },
  { id: "MSG-300", name: "Chinedu Okoye", company: "Swift Logistics", email: "chinedu@swiftlogistics.ng", phone: "+234 809 222 4411", message: "Please share a quote for docking stations, keyboards, and 12 HP notebooks.", priority: "Medium" },
  { id: "MSG-299", name: "Favour John", company: "Apex Media", email: "favour@apexmedia.ng", phone: "+234 803 778 1100", message: "Can you confirm if the Dell units can be delivered to Abuja this Friday?", priority: "Low" },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [query, setQuery] = useState("");

  const filteredMessages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return messages;
    return messages.filter((message) => [message.id, message.name, message.company, message.email, message.phone, message.message, message.priority].some((value) => value.toLowerCase().includes(needle)));
  }, [messages, query]);

  const markReviewed = (id: string) => {
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, priority: "Low" } : message)));
  };

  return (
    <AdminShell title="Messages" subtitle="Review customer contact information on its own page." searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search messages...">
      <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Contacts</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Customer contact information</h2>
          </div>
          <AdminBadge label="High" />
        </div>

        <div className="mt-5 grid gap-4">
          {filteredMessages.map((message) => (
            <article key={message.id} className="rounded-[1.4rem] border border-slate-100 p-4 md:p-5">
              <div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-slate-900">{message.name}</p><p className="text-sm text-slate-600">{message.company}</p></div><AdminBadge label={message.priority} /></div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><AdminIcon name="mail" />{message.email}</div>
                <div className="flex items-center gap-2"><AdminIcon name="user" />{message.phone}</div>
                <p className="leading-6 text-slate-700">{message.message}</p>
              </div>
              <div className="mt-4 flex justify-end"><button type="button" onClick={() => markReviewed(message.id)} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">Mark reviewed</button></div>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

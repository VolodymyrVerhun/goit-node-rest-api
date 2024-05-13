import * as fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const contactsPath = path.resolve("db", "contacts.json");

async function readContacts() {
  const data = await fs.readFile(contactsPath, { encoding: "utf-8" });
  return JSON.parse(data);
}
async function writeContacts(contacts) {
  await fs.writeFile(contactsPath, JSON.stringify(contacts, undefined, 2));
}
async function listContacts() {
  const contacts = await readContacts();
  return contacts;
}

async function getContactById(contactId) {
  const contacts = await readContacts();
  const contact = contacts.find((contact) => contact.id === contactId);
  if (typeof contact === "undefined") {
    return null;
  }
  return contact;
}

async function removeContact(contactId) {
  const contacts = await readContacts();
  const index = contacts.findIndex((contact) => contact.id === contactId);
  if (index === -1) {
    return null;
  }
  const removedContact = contacts[index];
  contacts.splice(index, 1);
  await writeContacts(contacts);
  return removedContact;
}

async function addContact(name, email, phone) {
  const contacts = await readContacts();
  const newContact = { id: crypto.randomUUID(), name, email, phone };
  contacts.push(newContact);
  await writeContacts(contacts);
  return newContact;
}

async function updateContact(contactId, body) {
  const contacts = await readContacts();
  const contactIndex = contacts.findIndex(
    (contact) => contact.id === contactId
  );
  if (contactIndex === -1) {
    return null;
  }

  contacts[contactIndex] = { ...contacts[contactIndex], ...body };

  await writeContacts(contacts);

  return contacts[contactIndex];
}

export default {
  listContacts,
  removeContact,
  getContactById,
  addContact,
  updateContact,
};

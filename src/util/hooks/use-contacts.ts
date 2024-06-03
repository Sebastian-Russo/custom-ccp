
import * as React from "react";
import "amazon-connect-streams";

function useVoiceContact(): connect.Contact | undefined {

  const [contact, setContact] = React.useState<connect.Contact>();

  React.useEffect(() => {

    connect.contact(contact => {
      if (contact.getType() !== "voice" && contact.getType() !== "queue_callback") return setContact(undefined);
      setContact(contact);
    });

  }, []);

  return contact;
}

function useContacts(): connect.Contact[] {

	const [contacts, editContacts] = React.useReducer((s: Record<string, connect.Contact>, f: (s: Record<string, connect.Contact>) => Record<string, connect.Contact>) => ({...f(s)}), {});

	React.useEffect(() => {

		connect.contact(contact => {
			const contact_id = contact.getContactId();
			if (contact_id in contacts) {
				console.warn("Duplicated contact found!:", contact_id);
				return;
			}

			editContacts(contacts => { contacts[contact_id] = contact; return contacts; });

			// Add removal listener:
			contact.onDestroy(() => editContacts(contacts => { delete contacts[contact_id]; return contacts; }));
		});

	}, []);

	return Object.values(contacts);
}

function useLatestContact(): connect.Contact | undefined {

  const [contact, setContact] = React.useState<connect.Contact>();

  React.useEffect(() => {

    connect.contact(contact => {
			setContact(contact);
		})

		return setContact(undefined);
  }, []);

  return contact;
}

export {
	useVoiceContact,
	useContacts,
	useLatestContact
};

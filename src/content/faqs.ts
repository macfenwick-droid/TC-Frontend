/**
 * FAQ copy — verbatim from the current site (sport-spectacle-hub/src/pages/FAQ.tsx).
 * Business content: change only with the owner's OK.
 */
export type Faq = { category: string; question: string; answer: string };

export const faqs: Faq[] = [
  {
    category: "General",
    question: "What is Ticket Cricket?",
    answer:
      "We are a platform that pays you same day for your event tickets. Our goal is to make the ticket selling process easy for you offering a hassle free experience by buying your tickets directly from you. Our offers will always be fair and your experience will be hassle free.",
  },
  {
    category: "General",
    question: "Do you sell tickets as well on Ticketcricket.co?",
    answer:
      "No, we currently only purchase tickets via Ticketcricket.co.",
  },
  {
    category: "General",
    question: "Do you sell tickets?",
    answer:
      "No, we currently only purchase tickets via Ticketcricket.co.",
  },
  {
    category: "General",
    question: "Do I need to create an account to sell you tickets?",
    answer:
      "Yes, create an account on our site, by clicking the log in button.",
  },
  {
    category: "Selling Process",
    question: "How do I make an offer?",
    answer:
      "It's simple, click on the sell to us button and it will take you to a form. Fill the form out with details around the tickets you are selling. Once the form is submitted, you will get a notification via email confirming receipt. You will then receive a response from our team regarding your offer.",
  },
  {
    category: "Selling Process",
    question: "I received a response from you and there is a timer on the bottom of the email. What is this timer referring to?",
    answer:
      "This countdown clock indicates how long we would accept the current deal for. If the time expires and you would still like to move forward with a deal, we would request that you resubmit the request.",
  },
  {
    category: "Selling Process",
    question: "How long is my offer valid for?",
    answer:
      "All offers from TicketCricket are valid for 24 hours from the time they are issued. If you do not accept the offer within that window, it will expire and you will need to resubmit a new request. Market conditions change frequently, so a new offer may differ from the previous one.",
  },
  {
    category: "Selling Process",
    question: "I resubmitted a new request but the offer is different than when I submitted previously, why is that?",
    answer:
      "Market value of tickets are very volatile and our offers are based on real time data available to the ticket cricket team. Therefore, our existing offers are based on this real time data.",
  },
  {
    category: "Selling Process",
    question: "I want to sell tickets to multiple events to TicketCricket, how do I do that?",
    answer:
      "Simply click on the \"sell to us\" link to access the form. You will see an option for \"selling multiple tickets\", please click on that and enter in the details as instructed on the form.",
  },
  {
    category: "Payments & Transfer",
    question: "Do I need to transfer tickets to you first before getting paid?",
    answer:
      "We will first provide you instructions on how and where to deliver your tickets to and then make a payment to you via PayPal or Venmo. Please note: If an event is canceled or if a refund is required due to issues determined to be your responsibility, we reserve the right to reverse the transaction to recover our funds.",
  },
  {
    category: "Payments & Transfer",
    question: "How long is it between when I transfer tickets to you and when I get paid?",
    answer:
      "Once you decide to move forward with selling tickets, you will get follow up instructions. We do our best to conduct the transaction in real time on the same day. One of our team members will coordinate the transactions with you live on our chat bot. Please note, the hours to get a live agent to work with you is between 9 AM and 9 PM Pacific Standard Time.",
  },
  {
    category: "Payments & Transfer",
    question: "How do you make payments if I sell to you?",
    answer:
      "At this time we pay via PayPal or Venmo (3% surcharge applies) only.",
  },
  {
    category: "Payments & Transfer",
    question: "Do I need to provide you with a credit card on file?",
    answer:
      "No, we do not require this for the time being. This is subject to change with clear notice to all users prior to implementation.",
  },
  {
    category: "Ticket Details",
    question: "What do you do with the tickets you purchase from me?",
    answer:
      "We secure tickets and offer them on secondary marketplaces or to clients who need reliable ticket inventory.",
  },
  {
    category: "Ticket Details",
    question: "I only have PDF version of the tickets or hard tickets, do you accept those?",
    answer:
      "Yes we accept PDF tickets, but they must be in original format from the issuing box office. We do not accept scanned copies of tickets, photographs of them etc. If you are offering hard tickets, while we do accept them, you will receive a follow up email with further instructions.",
  },
  {
    category: "Privacy",
    question: "If I sell you tickets, can you keep the sale discreet?",
    answer:
      "Yes, we never disclose our purchases or our member list unless requested by law enforcement or court order.",
  },
  {
    category: "Privacy",
    question: "I don't want people to know I sold tickets to you. Do you take that into consideration?",
    answer:
      "Yes, we 100% respect your privacy and do our best to restrict listing details like seat numbers or any other indicators that could indicate that you sold tickets to us. Please keep in mind, there are situations dictated by venues, organizations, and states that require seat numbers be displayed while listing.",
  },
  {
    category: "Cancellations & Returns",
    question: "If an event is cancelled, do I have to pay you back?",
    answer:
      "Yes, if an event is cancelled and not rescheduled we would seek our payment back for the sale. However if the event is rescheduled, then we would still consider our transaction as active.",
  },
  {
    category: "Cancellations & Returns",
    question: "I sold you tickets and now I need to get them back, would that be possible?",
    answer:
      "If we still have your tickets in our inventory, we would be more than happy to return them to you. However please note, we will require payment back to us via PayPal and a 2.5% total surcharge charge will be assessed.",
  },
];


/** Categories in first-seen order. */
export const faqCategories: string[] = [...new Set(faqs.map((f) => f.category))];

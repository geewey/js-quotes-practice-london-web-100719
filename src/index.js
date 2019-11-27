// It might be a good idea to add event listener to make sure this file
// only runs after the DOM has finished loading.

//api
const apiHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json"
};

const get = url => {
  return fetch(url).then(resp => resp.json());
};

const post = (url, postData) => {
  return fetch(url, {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify(postData)
  }).then(resp => resp.json());
};

const deleteRequest = (url, id) => {
  return fetch(url + id, {
    method: "DELETE",
    headers: apiHeaders
  }).then(resp => resp.json());
};

const patch = (url, id, editedPostData) => {
  return fetch(url + id, {
    method: "PATCH",
    headers: apiHeaders,
    body: JSON.stringify(editedPostData)
  }).then(resp => resp.json());
};

const API = { get, post, deleteRequest, patch };

//const
const QUOTES_WITH_LIKES_URL = "http://localhost:3000/quotes?_embed=likes";
const QUOTES_WITH_LIKES_SORTED_AUTHORS_URL =
  "http://localhost:3000/quotes?_sort=author&_embed=likes";
const QUOTES_URL = "http://localhost:3000/quotes/";
const LIKES_URL = "http://localhost:3000/likes";
const quoteList = document.querySelector("#quote-list");
const newQuoteForm = document.querySelector("#new-quote-form");
const editQuoteForm = document.querySelector("#edit-quote-form");
const sortButton = document.querySelector("#sort-button");

//event listeners
const activateSubmit = newQuoteForm.addEventListener("submit", e =>
  addQuote(e)
);
const activateEdit = editQuoteForm.addEventListener(
  "submit",
  () => submitEditQuote
);
const activateSort = sortButton.addEventListener("click", e => sortAuthors(e));

document.addEventListener("DOMContentLoaded", function() {
  getAllQuotes();
  activateSubmit;
  activateEdit;
  activateSort;
  editQuoteForm.className = "hidden";
});

//functions
const getAllQuotes = () => {
  API.get(QUOTES_WITH_LIKES_URL).then(quotes =>
    quotes.forEach(quote => displayQuote(quote))
  );
};

const getAllSortedQuotes = () => {
  API.get(QUOTES_WITH_LIKES_SORTED_AUTHORS_URL).then(quotes =>
    quotes.forEach(quote => displayQuote(quote))
  );
};

const displayQuote = quote => {
  const li = document.createElement("li");
  li.className = "quote-card";
  li.id = `${quote.id}`;

  const blockquote = document.createElement("blockquote");
  blockquote.className = "blockquote";

  const p = document.createElement("p");
  p.className = "mb-0";
  p.innerText = quote.quote;

  const footer = document.createElement("footer");
  footer.className = "blockquote-footer";
  footer.innerText = quote.author;

  const span = document.createElement("span");
  span.innerText = quote.likes.length;
  span.id = `${quote.id}`;

  const buttonSuccess = document.createElement("button");
  buttonSuccess.className = "btn-success";
  buttonSuccess.innerText = "Likes: ";
  buttonSuccess.addEventListener("click", () => increaseLikes(quote, span));

  const buttonDelete = document.createElement("button");
  buttonDelete.className = "btn-danger";
  buttonDelete.innerText = "Delete";
  buttonDelete.addEventListener("click", () => deleteQuoteFromApi(quote));

  const buttonEdit = document.createElement("button");
  buttonEdit.className = "btn-warning";
  buttonEdit.innerText = "Edit";
  buttonEdit.addEventListener("click", e => displayEditQuote(quote));

  buttonSuccess.append(span);
  blockquote.append(p, footer, buttonSuccess, buttonDelete, buttonEdit);
  li.append(blockquote);
  quoteList.append(li);
};

const addQuote = e => {
  e.preventDefault();
  const postData = {
    quote: newQuoteForm["new-quote"].value,
    author: newQuoteForm["author"].value,
    likes: []
  };

  newQuoteForm["new-quote"].value = "";
  newQuoteForm["author"].value = "";

  API.post(QUOTES_URL, postData).then(quote => displayQuote(quote));
};

const deleteQuoteFromApi = quote => {
  API.deleteRequest(QUOTES_URL, quote.id).then(removeQuote(quote));
};

const removeQuote = quote => {
  const foundQuote = document.getElementById(`${quote.id}`);
  foundQuote.remove();
};

const increaseLikes = (quote, span) => {
  const quoteId = quote.id;
  const postData = {
    quoteId,
    createdAt: Math.floor(Date.now() / 1000)
  };
  API.post(LIKES_URL, postData).then(updateLikes(span));
};

const updateLikes = span => {
  const newSpan = Number(span.innerText) + 1;
  span.innerText = newSpan;
};

const displayEditQuote = quote => {
  const editQuote = document.querySelector("#edit-quote");
  const editAuthor = document.querySelector("#edit-author");
  toggleQuoteForm(quote, editQuote, editAuthor);
};

const toggleQuoteForm = (quote, editQuote, editAuthor) => {
  if (editQuoteForm.className === "hidden") {
    // hide new quote form
    newQuoteForm.className = "hidden";
    // display edit form
    editQuoteForm.classList.remove("hidden");
    // fill-in information
    updateEditQuoteForm(quote, editQuote, editAuthor);
  } else if (editQuoteForm.className === `${quote.id}`) {
    // remove edit quote class
    editQuoteForm.classList.remove(`${quote.id}`);
    // hide edit quote form
    editQuoteForm.className = "hidden";
    // hidedisplay new quote form
    newQuoteForm.classList.remove("hidden");
  } else {
    // set edit form class equal to target quote-id
    updateEditQuoteForm(quote, editQuote, editAuthor);
  }
};

const updateEditQuoteForm = (quote, editQuote, editAuthor) => {
  // set edit form class equal to target quote-id
  editQuoteForm.className = `${quote.id}`;
  // set placeholders and prefilled values
  editQuote.placeholder = quote.quote;
  editQuote.value = quote.quote;
  editAuthor.placeholder = quote.author;
  editAuthor.value = quote.author;
};

const submitEditQuote = () => {
  const quoteId = e.target.className;
  const editedPostData = {
    quote: editQuoteForm["edit-quote"].value,
    author: editQuoteForm["edit-author"].value
  };
  API.patch(QUOTES_URL, quoteId, editedPostData).then(updateQuote);
};

const updateQuote = editedQuote => {
  const quoteToEdit = document.getElementById(editedQuote.id);
  const quoteQuoteToEdit = quoteToEdit.querySelector("p");
  const quoteAuthorToEdit = quoteToEdit.querySelector("footer");
  quoteQuoteToEdit.innerText = editedQuote.quote;
  quoteAuthorToEdit.innerText = editedQuote.author;
};

const sortAuthors = e => {
  if (sortButton.className === "sorted") {
    sortButton.innerText = "Sort by author name: OFF. Click to turn on.";
    sortButton.classList.remove("sorted");
    while (quoteList.firstChild) {
      quoteList.firstChild.remove();
    }
    getAllQuotes();
    // console.log("this unsorts");
  } else {
    while (quoteList.firstChild) {
      quoteList.firstChild.remove();
    }
    getAllSortedQuotes();
    sortButton.innerText = "Sort by author name: ON. Click to turn off.";
    sortButton.className = "sorted";
    // console.log("this path sorts!");
  }
};

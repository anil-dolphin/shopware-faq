import Plugin from 'src/plugin-system/plugin.class';
import HttpClient from 'src/service/http-client.service';

export default class Productfaq extends Plugin {
    init() {
        this._client = new HttpClient();
        this._registerEvents();
    }
    _registerEvents() {
        var formShowButton = document.querySelectorAll('#askquebtn');
        var formCloseButton = document.querySelectorAll('#closeform');
        var formSubmitButton = document.querySelectorAll('#que_submit');
        var faqList = document.getElementsByClassName('product-faq-list');

        if (formShowButton.length) {
            for (var i = 0; i < formShowButton.length; i++) {
                formShowButton[i].addEventListener('click', this._formShow.bind(this));
                formCloseButton[i].addEventListener('click', this._formHide.bind(this));
                formSubmitButton[i].addEventListener('click', this._formSubmit.bind(this));
            }
        }
        var pageDivs = document.getElementsByClassName('faq-page');
        for (var i = 0; i < pageDivs.length; i++) {
            pageDivs[i].addEventListener('click', this._faqPagination.bind(this));
        }
        if (faqList.length) {
            var faqQue = document.getElementsByClassName('que_content');
            var faqAns = document.getElementsByClassName('answer-section');
            Array.from(faqQue).forEach(function (element, index) {
                element.addEventListener('click', function () {
                    if (faqAns[index].style.display === 'none') {
                        element.classList.add('active');
                        faqAns[index].style.display = 'block';
                    } else {
                        faqAns[index].style.display = 'none';
                        element.classList.remove('active');
                    }
                });
            });
        }

    }
    _formShow(event) {
        var formShowButton = document.querySelectorAll('#askquebtn');
        var form = document.querySelectorAll('#askqueform');
        for (var i = 0; i < formShowButton.length; i++) {
            formShowButton[i].style.display = 'none';
            form[i].style.display = 'inline-block';
        }

    }
    _formHide(event) {
        var formShowButton = document.querySelectorAll('#askquebtn');
        var form = document.querySelectorAll('#askqueform');
        for (var i = 0; i < formShowButton.length; i++) {
            formShowButton[i].style.display = 'inline-block';
            form[i].style.display = 'none';
        }
    }
    _formValidate() {
        var div = document.querySelectorAll('#askqueform');
        var inputFields = div[div.length - 1].querySelectorAll('textarea, input');

        var values = {};
        var error = false
        inputFields.forEach(function (input) {
            if (!input.value) {
                error = true;
                var errorDiv = document.querySelectorAll('#' + input.name + '-error');
                if (errorDiv.length) {
                    for (var i = 0; i < errorDiv.length; i++) {
                        errorDiv[i].style.display = 'inline-block';
                    }
                }
            } else {
                var errorDiv = document.querySelectorAll('#' + input.name + '-error');
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (input.name === 'email' && !regex.test(input.value)) {
                    error = true;
                    if (errorDiv.length) {
                        for (var i = 0; i < errorDiv.length; i++) {
                            errorDiv[i].style.display = 'inline-block';
                        }
                    }
                } else {
                    if (errorDiv.length) {
                        for (var i = 0; i < errorDiv.length; i++) {
                            errorDiv[i].style.display = 'none';
                        }
                    }
                }
            }
            values[input.name] = input.value;
        });
        if (error) {
            return false;
        }
        return values;
    }
    _formSubmit(event) {
        event.preventDefault();
        var formData = this._formValidate();
        var requestUrl = document.getElementById("queform").action;
        if (formData) {
            var payload = JSON.stringify(formData);
            this._client.post(
                requestUrl,
                payload,
                (response) => {
                    location.reload(true);
                }
            );
        }
    }
    _faqPagination(event) {
        if (event.target.classList.contains('active') === false) {
            var pageDivs = document.getElementsByClassName('faq-page');
            var dataDiv = document.getElementById("product-faq-pagination-pages");
            var requestUrl = dataDiv.getAttribute("data-url");
            var product = dataDiv.getAttribute("data-product");
            var limit = parseInt(dataDiv.getAttribute("data-limit"));
            var total = parseInt(dataDiv.getAttribute("data-total"));
            Array.from(pageDivs).forEach(function (element) {
                element.classList.remove('active');
            });
            event.target.classList.add('active');
            var pageNumber = parseInt(event.target.textContent);
            var payload = JSON.stringify({ 'pageNumber': pageNumber, 'product': product, 'limit': limit });
            this._client.post(
                requestUrl,
                payload,
                (response) => {
                    const responseData = JSON.parse(response);
                    if (responseData.status === 200) {
                        if (responseData.data.length) {
                            var appendData = '';
                            responseData.data.forEach(function (faqData) {
                                var faq = `<div class="product-faq-item">
                                            <div class="que_content">
                                                <span class="que_icon">
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm169.8-90.7c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"></path></svg>
                                                </span>
                                                <span class="que_content_text">
                                                    `+ faqData.question + `
                                                </span>
                                                <span class="angle_arrow">
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="27" viewBox="0 -960 960 960"><path d="M480-345 240-585l43-43 197 198 197-197 43 43-240 239Z"></path></svg>
                                                </span>
                                            </div>
                                            <div class="answer-section" style="display: none;">
                                                <div class="answer-section-text">
                                                `+ faqData.answer + `
                                                </div>
                                            </div>
                                           </div>`;
                                appendData = appendData + faq;
                            });
                            for (var i = 0; i < document.querySelectorAll('#product-faq-items').length; i++) {
                                document.querySelectorAll('#product-faq-items')[i].innerHTML = appendData
                            }
                            var newStart = limit * (pageNumber - 1) + 1;
                            var newEnd = newStart + limit;
                            newEnd = newEnd < total ? newEnd : total;
                            var newtotal = `<p>Items ` + newStart + ` to ` + newEnd + ` of ` + total + ` total</p>`;
                            for (var i = 0; i < document.querySelectorAll('#product-faq-pagination-total').length; i++) {
                                document.querySelectorAll('#product-faq-pagination-total')[i].innerHTML = newtotal
                            }
                            var faqQue = document.getElementsByClassName('que_content');
                            var faqAns = document.getElementsByClassName('answer-section');
                            Array.from(faqQue).forEach(function (element, index) {
                                element.addEventListener('click', function () {
                                    if (faqAns[index].style.display === 'none') {
                                        element.classList.add('active');
                                        faqAns[index].style.display = 'block';
                                    } else {
                                        faqAns[index].style.display = 'none';
                                        element.classList.remove('active');
                                    }
                                });
                            });
                        }

                    }

                }
            );
        }
    }
}
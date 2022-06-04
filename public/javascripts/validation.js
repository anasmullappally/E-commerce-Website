jQuery.validator.addMethod("lettersonly", function (value, element) {
    return this.optional(element) || /^[a-z]+$/i.test(value);
}, "Letters only please");
// jQuery.validator.addMethod("numbersonly", function (value, element) {
//     return this.optional(element) || /^[0-9]+$/i.test(value);
// }, "Numbers only please");

$(document).ready(function () {
    $("#userSignup").validate({
        rules:
        {
            fName: {
                required: true,
                minlength: 4,
                maxlength: 20,
                lettersonly: true
            },
            lName: {
                required: true,
                minlength: 1,
                maxlength: 20,
                lettersonly: true
            },
            pNumber: {
                required: true,
                length: 10,
                numbersonly: true
            },
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 5
            },
            cPassword: {
                required: true,
                equalTo: '#password'
            }

        }
    })
})
$(document).ready(function () {
    $("#userLogin").validate({
        rules:
        {
            email: {
                required: true,
                email: true
            },
            Password: {
                required: true
            }
        }
    })
})
$(document).ready(function () {
    $("#vendorSignup").validate({
        rules:
        {
            firstName: {
                required: true,
                minlength: 4,
                maxlength: 20,
                lettersonly: true
            },
            lastName: {
                required: true,
                minlength: 1,
                maxlength: 20,
                lettersonly: true
            },
            phoneNumber: {
                required: true,
                length: 10,
                numbersonly: true
            },
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 5
            },
            cPassword: {
                required: true,
                equalTo: '#password'
            }

        }
    })
})
$(document).ready(function () {
    $("#vendorLogin").validate({
        rules:
        {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true
            }
        }
    })
})

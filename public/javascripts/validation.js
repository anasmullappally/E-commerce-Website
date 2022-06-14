jQuery.validator.addMethod("lettersonly", function (value, element) {
    return this.optional(element) || /^[a-z]+$/i.test(value);
}, "Letters only please");


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

$(document).ready(function () {
    $("#checkOutform").validate({
        rules: {
            country: {
                required: true
            },
            firstName: {
                required: true,
                minlength: 5
            },
            lastName: {
                required: true
            },
            address1: {
                required: true,
                minlength: 6
            },
            state: {
                required: true
            },
            zip: {
                required: true,
                numbersonly: true
            },
            email: {
                required: true,
                email: true
            },
            phone: {
                required: true,
                length: 10,
                numbersonly: true
            }
        }
    })
})
$(document).ready(function () {
    $("#contactForm").validate({
        rules: {
            c_fname: {
                required: true,
                minlength: 4,
                
            },
            c_lname: {
                required: true,
                minlength: 4
            },
            c_email: {
                email: true,
                required: true
            },
            c_message: {
                required: true,
                minlength: 5
            }


        }
    })
})

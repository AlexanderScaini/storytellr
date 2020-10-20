// accessing login form from the client side

$(document).ready(() => {
  // testing show a login page
  // show registration form

  $('nav #profile').click(() => {

    if($('nav #profile').html() !== 'registration') {
      // logout functionality
      alert('profile page!');
    } else {
      $('nav #profile').hide();
      $('nav #login').hide();
      $('nav .nav-options').append(loginForm('registration'));
      $('nav .nav-options form').hide();
      $('nav .nav-options form').slideDown();
    }

  })

  $(document).on('submit', 'nav .nav-options #form-registration', (event) => {
    // alert("it's working!");
    event.preventDefault();
    // show login button and change to logout

    $('nav .nav-options form').hide();

    console.log($(event.target).serialize());
    $.ajax({
      url: 'users/register',
      method: "POST",
      data: $(event.target).serialize()
    })
    .then(user => {
      console.log(user);
      // console.log(user.user);
      console.log(user.name);
      $('nav #login').fadeIn();
      $('nav #login').html('logout');

      $('nav #profile').html(user.name);
      $('nav #profile').fadeIn();

    })

  })

  // $('#submit-login').click((event) => {
    // event.preventDefault(); // this does not seem to work!
    // $.ajax({
    // });
  // });

});
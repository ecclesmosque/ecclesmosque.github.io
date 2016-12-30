---
layout: page
permalink: /contact-us/
title: Contact us
---

<div class="em-layout em-module__content--contact-us">
	<div class="em-layout__item em-module__content--contact-us-form">
		Use the form below to get in touch, or <a href="#contact-us-details">give us a call</a>.

		<form class="em-contact-us-form em-layout" action="https://mwtorguk.wufoo.com/forms/contact-form/" enctype="multipart/form-data" method="POST">

			<div class="em-contact-us-form__field-wrapper em-layout__item">
			    <label>Message <span class='required'>(required)</span>
			    	<textarea id="Field1" name="Field1" rows='10' required placeholder="Type your message..."></textarea>
				</label>
			</div>

			<div class="em-contact-us-form__field-wrapper em-layout__item em-contact-us-form__field-first-name">
				<label>First Name <span class='required'>(required)</span>
					<input type='text' id="Field4" name='Field4' placeholder='First name' required />
				</label>
			</div>

			<div class="em-contact-us-form__field-wrapper em-layout__item em-contact-us-form__field-last-name">
				<label>Last Name <span class='required'>(required)</span>
					<input type='text' id="Field5" name='Field5' placeholder='Last name' required />
				</label>
			</div>

			<div class="em-contact-us-form__field-wrapper em-layout__item em-contact-us-form__field-email">
			    <label>Email <span class='required'>(required)</span>
			    	<input type='email' id="Field2" name='Field2' placeholder='you@yourdomain.com' required />
				</label>
			</div>

			<div class="em-contact-us-form__field-wrapper em-layout__item em-contact-us-form__field-tel">
			    <label>Tel
				    <input type='tel' id="Field6" name='Field6' placeholder='Your telephone' />
				</label>
			</div>

			<div class="em-contact-us-form__field-wrapper em-layout__item">
			    <button class="em-contact-us-form__field-submit-btn" type='submit' value="Send Email">Send Message</button>
			</div>

			<div class="em-contact-us-form__hide">
				<label for="comment">Do Not Fill This Out</label>
				<textarea name="comment" id="comment" rows="1" cols="1"></textarea>
				<input type="hidden" id="idstamp" name="idstamp" value="fTWaGyJXL3CP6LH+QrxkQk8RWZyxAKRjE32tcsWSllo=" />
			</div>

		</form>

	</div>

	<div id="contact-us-details" class="em-layout__item em-module__content--contact-us-details">
		{% include contacts.html %}
	</div>
</div>
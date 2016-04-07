var React = require('react');


var NotFound = React.createClass({
	render: function() {

		return (
			<div className="well bs-component">
				<section>
			        <div id="center" className="container">
			        	<h1>404! Page not found.</h1>
			        </div>
			    </section>
			</div>

		);
	}
});

module.exports = NotFound;
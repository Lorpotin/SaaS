var React = require('react');


var TopNav = React.createClass({
	render: function() {

		return (
			<nav className="navbar navbar-fixed-top nav-top">
				<div className="header-page">
					<h4>{this.props.pageName}</h4>
				</div>
			</nav>
		);
	}
});

module.exports = TopNav;
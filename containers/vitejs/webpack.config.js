module.exports = {
	module: {
	  rules: [
		{
		  test: /\.(svg|png)$/,
		  use: 'file-loader',
		},
	  ],
	},
  }
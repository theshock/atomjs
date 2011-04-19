Atom.Plugins.Uri
======================

## atom.accessors.uri(str = location.href)

Parse and returns object - parts of uri `str`

Available such properties:
* anchor
* query
* file
* directory
* path
* relative
* port
* host
* password
* user
* userInfo
* authority
* protocol
* source
* queryKey

#### Examples:
	atom.uri('http://usr:pwd@www.example.com:81/dir/dir.2/index.htm?q1=0&&test1&test2=value#top');
	/* {
		anchor: 'top',
		query: 'q1=0&&test1&test2=value',
		file: 'index.htm',
		directory: '/dir/dir.2/',
		path: '/dir/dir.2/index.htm',
		relative: '/dir/dir.2/index.htm?q1=0&&test1&test2=value#top',
		port: '81',
		host: 'www.example.com',
		password: 'pwd',
		user: 'usr',
		userInfo: 'usr:pwd',
		authority: 'usr:pwd@www.example.com:81',
		protocol: 'http',
		source: uri,
		queryKey: {
			q1: '0',
			test1: '',
			test2: 'value'
		}
	}; */


	atom.uri('/dir/dir.2/index.htm?q1=0&&test1&test2=value#top');
	/* {
		anchor: 'top',
		query: 'q1=0&&test1&test2=value',
		file: 'index.htm',
		directory: '/dir/dir.2/',
		path: '/dir/dir.2/index.htm',
		relative: '/dir/dir.2/index.htm?q1=0&&test1&test2=value#top',
		port: '',
		host: '',
		password: '',
		user: '',
		userInfo: '',
		authority: '',
		protocol: '',
		source: uri,
		queryKey: {
			q1: '0',
			test1: '',
			test2: 'value'
		}
	}; */
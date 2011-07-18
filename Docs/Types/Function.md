# Static Function methods

### lambda
	Function.lambda(value)

Creates a function that returns `value`

### copier
	Function.copier(value)

Creates a function that returns clone of `value` 

### log
	Function.log(value)

Creates a function that log `value`

	var obj    = {},
	    logObj = Function.log(obj);
	obj.foo = 2; 
	logObj(); //({foo:2})
	

### context

# Dynamic Function methods

### context(context, arguments)
### delay(time, context, args)
### periodical(time, context, args)
### only(numberOfArgs, context)
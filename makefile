all: dev

dev: 
	npm install

test: 
	npm test -- --coverage

run: 
	npm start

doc: 
	echo "TODO"

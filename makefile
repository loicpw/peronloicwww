all: dev

dev: 
	npm install

test: 
	npm test -- --coverage --collectCoverageFrom=src/components/**/*.js --collectCoverageFrom=src/App.js --collectCoverageFrom='!src/components/tests/*.js'

run: 
	npm start

doc: 
	echo "TODO"

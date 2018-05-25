run:
	cd src && python3 -m http.server


deploy:
	git subtree push --prefix src origin gh-pages


clean:
	find . -type f -name ".*.swp" -exec rm -f {} \;
	find . -type f -name ".*.swo" -exec rm -f {} \;
	find . -type f -name ".*.pyc" -exec rm -f {} \;
	find . -type f -name ".*.pyo" -exec rm -f {} \;

.PHONY: deploy run

run:
	cd src && python3 -m http.server


deploy:
	gsutil cp -r src/* gs://physics-assignment/ && gsutil acl ch -r -u AllUsers:R 'gs://physics-assignment/*'


clean:
	find . -type f -name ".*.swp" -exec rm -f {} \;
	find . -type f -name ".*.swo" -exec rm -f {} \;
	find . -type f -name ".*.pyc" -exec rm -f {} \;
	find . -type f -name ".*.pyo" -exec rm -f {} \;

.PHONY: deploy run

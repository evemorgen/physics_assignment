# Modeling of physical systems assignment - multibody collisions in molecular dynamics

## Usage:
  - It is highly recommended to use web hosted version of this project, it is avaliable at:   <https://goo.gl/keWpja>
  - To test it localy, follow development guide
  

## Development:
  1. `git clone https://github.com/evemorgen/physics_assignment.git ~/physics_assignment`
  2. `cd ~/physics_assignment && python -m SimpleHTTPServer`
  3. open `http://localhost:8000` in your favorite web browser
  3. change sketch.js or its dependencies and refresh webpage

## Deploy:
```bash
gsutil cp -r src/* gs://physics-assignment/ && gsutil acl ch -u AllUsers:R 'gs://physics-assignment/*'
```

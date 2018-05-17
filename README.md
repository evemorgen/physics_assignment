# Modeling of physical systems assignment - multibody collisions in molecular dynamics

## Usage:
  - It is highly recommended to use web hosted version of this project, it is avaliable at:   <https://goo.gl/keWpja>
  - To test it localy, follow development guide
  

## Development:
  1. `git clone https://github.com/evemorgen/physics_assignment.git`
  2. `make run`
  3. open `http://localhost:8000` in your favorite web browser
  3. change sketch.js or its dependencies and refresh webpage

## Deploy:
Deployment is simple as `make deploy`, however if you wish to do it manualy, here is how:
```bash
gsutil cp -r src/* gs://physics-assignment/ && gsutil acl ch -r -u AllUsers:R 'gs://physics-assignment/*'
```

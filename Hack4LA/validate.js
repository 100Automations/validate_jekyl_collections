import { readdir, readFile, unlinkSync, readFileSync, appendFileSync } from 'fs';
import fm from 'front-matter';
import { Validator } from 'jsonschema';
const v = new Validator();

//["Active","On Hold","Completed"]
const schemaOptions ={
  "Active": "schema_active.json",
  "On Hold": "schema_onHold.json",
  "Completed": "schema_completed.json"
}

readdir('./Hack4LA/testFiles/',function(err,files){
  if (err) {
    throw err;
  }

  files.forEach(function(file,index){

    readFile(`./Hack4LA/testFiles/${file}`, 'utf8', function(err, data){
      if (err) {
        throw err;
      }
      try{
        let {attributes} = fm(data)
        let filePath = `./Hack4LA/${attributes.status}_validationResult.json`;
        let schema = JSON.parse(readFileSync(`./Hack4LA/schemas/${schemaOptions[attributes.status]}`));
        let x = v.validate(attributes, schema)
        
        if(x.errors.length > 0){
          let arr = [];
          for(let item of x.errors){
            arr.push({"message":item.message,"stack":item.stack})
          }
          let obj = {'filename':file,'errors': arr}
          appendFileSync(filePath, JSON.stringify(obj,null,4),() => {})
        }
        
      }
      catch(err){
        console.log(file,err)
      }

    })
  })


    
})


/**
 * Give a folder thats a jekyl collections and a json schema, generate a report on weather the front matter
 * of each file follows the constraint as specified in the json schema
 * 
 * @param {String} collection_dir - The path to a directory that's a jekyll collection
 * @param {String} schema - The path to a schema file to validate the collections front matter against
 * @return {JSON} - Returns a json object/Saves to file result of the validation
 *
 */
var server = require('../server/server');
var csv = require("fast-csv");

var args = process.argv.slice(2);
var name = null;
if(args[0].indexOf('name') > -1) {
    name = (args[0].split('='))[1];
}

var clearCategory = args.indexOf('forceEmpty') > -1;
if(name != null && name.length > 0) {
    parseCSV(name);
} else {
    console.log("Specify the parameter name with the CSV name");
}

function parseCSV(name) {
    csv.fromPath("QuestionSeeder/" + name + ".csv")
    .on("data", function(data){
        const row = data;
        let promises = new Array();
        let question = {
            question: data[0],
            questionCategoryId: (args[1].split('='))[1],
            profitExp: data[5],
            createdAt: new Date(),
            lastModifiedAt: new Date()
        };

        if(clearCategory){
            promises.push(new Promise((resolve, reject) => {
                server.models.Question.destroyAll({ questionCategoryId: (args[1].split('='))[1] }, (err, deleted) => {
                    resolve();
                });
            }));
        }

        promises.push(new Promise((resolve, reject) => {
            server.models.Question.create(question, (err, result) => {
                if(result && result.id) {
                    let options = data[4];
                    options = options.split(';');
                    for(var idx in options) {
                        let option = options[idx];
                        option = option.replace('1-', '');
                        option = option.replace('2-', '');
                        option = option.replace('3-', '');
                        option = option.replace('4-', '');
                        let questionOption = {
                            questionId: result.id,
                            name: option.trim(),
                            isCorrect: (idx == 0) ? true : false,
                            profitExp: (idx == 0 && result.profitExp) ? result.profitExp : null
                        }
                        server.models.QuestionOption.create(questionOption, (err1, result1) => {
                            resolve();
                        });
                    }
                }
                resolve();
            });
        }));

        Promise.all(promises).then((data) => {
            console.log("Done!");
        });
    })
    .on("end", function(){
    });
}
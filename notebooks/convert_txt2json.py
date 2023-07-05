import json
fold = "/home/doga/GitHubUbuntU/runApp/assets/plottable_run_examples/"
fname = "runPositions_20230702_092833_1"
with open(fold+fname+".txt", 'r') as file:
    s = file.read()
x = json.loads(s)
json_object = json.dumps(x, indent=4)
print(json_object)

# Writing to sample.json
with open(fold+fname+".json", "w") as outfile:
    outfile.write(json_object)
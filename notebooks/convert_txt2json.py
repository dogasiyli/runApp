import json
import sys 

def convert_txt(fname):
    fold = "assets/plottable_run_examples/"
    with open(fold+fname+".txt", 'r') as file:
        s = file.read()
    x = json.loads(s)
    json_object = json.dumps(x, indent=4)
    print(f"first two samples of len({len(x)}):\n {x[:2]}")

    # Writing to sample.json
    print(f"Writing to {fname}.json")
    with open(fold+fname+".json", "w") as outfile:
        outfile.write(json_object)
    print("Done.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide the fname.")
        sys.exit(1)
    
    print(len(sys.argv))
    fname = sys.argv[1]
    convert_txt(fname)

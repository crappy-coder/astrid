import Dictionary from "../../src/Dictionary"

describe("Dictionary", function () {
    describe("class validation", function () {
        it("is a class", function () {
            Dictionary.must.be.a.Function();
        });
    });

    var stringKey = "a";
    var objectKey = {a: 1};

    describe("set() and get()", function () {
        it("set and get a value using an string key", function () {
            var d = new Dictionary();
            d.set(stringKey, 1);

            Should(d.get(stringKey)).not.be.null().and.is.equal(1);
        });

        it("set and get a value using an object key", function () {
            var d = new Dictionary();

            d.set(objectKey, 1);
            Should(d.get(objectKey)).not.be.null().and.is.equal(1);
        });

        it("get should return null value when string key does not exist", function () {
            var d = new Dictionary();

            Should(d.get(stringKey)).be.null();
        });

        it("get should return null value when object key does not exist", function () {
            var d = new Dictionary();

            Should(d.get(objectKey)).be.null();
        });

        it("set returns true or false when string key is new or updated", function () {
            var d = new Dictionary();

            Should(d.set(stringKey, 1)).be.true();
            Should(d.set(stringKey, 2)).be.false();
        });

        it("set returns true or false when object key is new or updated", function () {
            var d = new Dictionary();

            Should(d.set(objectKey, 1)).be.true();
            Should(d.set(objectKey, 2)).be.false();
        });
    });

    describe("remove()", function () {
        it("entry is removed by using an string key", function () {
            var d = new Dictionary();
            d.set(stringKey, 1);

            Should(d.exists(stringKey)).be.true();
            d.remove(stringKey);
            Should(d.exists(stringKey)).be.false();
        });

        it("entry is removed by using an object key", function () {
            var d = new Dictionary();

            d.set(objectKey, 1);
            Should(d.exists(objectKey)).be.true();
            d.remove(objectKey);
            Should(d.exists(objectKey)).be.false();
        });

        it("return true when using an string key that exists", function () {
            var d = new Dictionary();
            d.set(stringKey, 1);

            Should(d.remove(stringKey)).be.true();
        });

        it("return false when using an string key that does not exist", function () {
            var d = new Dictionary();

            Should(d.remove(stringKey)).be.false();
        });

        it("return true when using an object key that exists", function () {
            var d = new Dictionary();
            d.set(objectKey, 1);

            Should(d.remove(objectKey)).be.true();
        });

        it("return false when using an object key that does not exist", function () {
            var d = new Dictionary();

            Should(d.remove(objectKey)).be.false();
        });
    });

    describe("clear()", function () {
        it("all entries are removed", function () {
            var d = new Dictionary();
            d.set(stringKey, 1);
            d.set(objectKey, 1);

            Should(d.count).be.equal(2);
            d.clear();
            Should(d.count).be.equal(0);
        });
    });

    describe("exists()", function () {
        it("return true when the string key exists", function () {
            var d = new Dictionary();
            d.set(stringKey, 1);

            Should(d.exists(stringKey)).be.true();
        });

        it("return false when the string key does not exist", function () {
            var d = new Dictionary();

            Should(d.exists(stringKey)).be.false();
        });

        it("return true when the object key exists", function () {
            var d = new Dictionary();
            d.set(objectKey, 1);

            Should(d.exists(objectKey)).be.true();
        });

        it("return false when the object key does not exist", function () {
            var d = new Dictionary();

            Should(d.exists(objectKey)).be.false();
        });
    });

    describe("count", function () {
        it("return the number of entries", function () {
            var d = new Dictionary();

            Should(d.count).be.equal(0);
            d.set(stringKey, 1);
            d.set(objectKey, 1);
            Should(d.count).be.equal(2);
        });
    });

    describe("keys", function () {
        it("return an array of string and object keys", function () {
            var d = new Dictionary();

            d.set(stringKey, 1);
            d.set(objectKey, 1);

            var keys = d.keys;

            Should(keys).be.Array().and.have.length(2);
            Should(keys[0]).be.equal(stringKey);
            Should(keys[1]).be.eql(objectKey);
        });
    });

    describe("values", function () {
        it("return an array of values for entries with string and object keys", function () {
            var d = new Dictionary();

            d.set(stringKey, 1);
            d.set(objectKey, 1);

            var values = d.values;

            Should(values).be.Array().and.have.length(2);
            Should(values[0]).be.equal(1);
            Should(values[1]).be.equal(1);
        });
    });
});

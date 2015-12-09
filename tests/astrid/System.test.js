import { default as System, SystemInfo } from "../../src/System"

describe("System", function () {
    it("should be an object", function () {
        System.should.be.a.Object();
    });
});

describe("SystemInfo", function () {
    it("should be an object", function () {
        SystemInfo.should.be.a.Object();
    });
});
